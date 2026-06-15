import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

// Separate webhook secret for subscription events.
// Register at https://dashboard.stripe.com/webhooks with events:
//   checkout.session.completed
//   customer.subscription.updated
//   customer.subscription.deleted
//
// Set STRIPE_SUBSCRIPTION_WEBHOOK_SECRET in Vercel env.
//
// Falls back to STRIPE_WEBHOOK_SECRET if the subscription-specific
// secret is not yet set (useful during initial rollout).

function getWebhookSecret(): string {
  return (
    process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    ''
  );
}

type ProviderUpdate = {
  is_verified?: boolean;
  is_featured?: boolean;
  subscription_tier?: string | null;
  subscription_status?: string | null;
  subscription_interval?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
  updated_at: string;
};

async function applyTierUpdate(
  providerId: string,
  update: ProviderUpdate,
): Promise<boolean> {
  const admin = createAdminClient();
  const { error, count } = await admin
    .from('providers')
    .update(update, { count: 'exact' })
    .eq('id', providerId);
  if (error) {
    console.error('[sub webhook] DB update error:', error);
    return false;
  }
  return (count ?? 0) > 0;
}

async function findProviderByCustomer(customerId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('providers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.id || null;
}

export async function POST(request: NextRequest) {
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    console.error('[sub webhook] No webhook secret configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[sub webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.product !== 'cyberbench_subscription') break;
        if (session.payment_status !== 'paid') break;

        const providerId = session.metadata?.provider_id;
        const tier = session.metadata?.tier;
        const interval = session.metadata?.interval;
        if (!providerId || !tier) break;

        const customerId =
          typeof session.customer === 'string' ? session.customer : null;
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : null;

        await applyTierUpdate(providerId, {
          is_verified: tier === 'verified' || tier === 'featured',
          is_featured: tier === 'featured',
          subscription_tier: tier,
          subscription_status: 'active',
          subscription_interval: interval || null,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        });

        console.log(`[sub webhook] checkout.session.completed → provider ${providerId} tier=${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.product !== 'cyberbench_subscription') break;

        const providerId =
          sub.metadata?.provider_id ||
          (await findProviderByCustomer(
            typeof sub.customer === 'string' ? sub.customer : '',
          ));
        if (!providerId) break;

        const tier = sub.metadata?.tier;
        const interval = sub.metadata?.interval;
        const status = sub.status; // active | past_due | canceled | ...
        // current_period_end removed from Stripe API 2026-05-27.dahlia; skip for now
        const periodEnd: string | null = null;

        const isActive = status === 'active' || status === 'trialing';
        await applyTierUpdate(providerId, {
          is_verified: isActive && (tier === 'verified' || tier === 'featured'),
          is_featured: isActive && tier === 'featured',
          subscription_tier: isActive ? tier || null : null,
          subscription_status: status,
          subscription_interval: interval || null,
          stripe_subscription_id:
            typeof sub.id === 'string' ? sub.id : null,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        });

        console.log(`[sub webhook] subscription.updated → provider ${providerId} status=${status} tier=${tier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.product !== 'cyberbench_subscription') break;

        const providerId =
          sub.metadata?.provider_id ||
          (await findProviderByCustomer(
            typeof sub.customer === 'string' ? sub.customer : '',
          ));
        if (!providerId) break;

        // Downgrade: remove verified/featured flags
        await applyTierUpdate(providerId, {
          is_verified: false,
          is_featured: false,
          subscription_tier: null,
          subscription_status: 'canceled',
          subscription_interval: null,
          stripe_subscription_id: typeof sub.id === 'string' ? sub.id : null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        });

        console.log(`[sub webhook] subscription.deleted → provider ${providerId} downgraded`);
        break;
      }

      default:
        // Acknowledge everything else
        break;
    }
  } catch (err) {
    console.error('[sub webhook] processing error:', err);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
