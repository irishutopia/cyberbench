import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createAdminClient, createServerClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/constants';

// Map tier+interval → price IDs configured in Vercel env
function getPriceId(tier: string, interval: string): string | undefined {
  const map: Record<string, string | undefined> = {
    'verified:monthly': process.env.STRIPE_VERIFIED_MONTHLY_PRICE_ID,
    'verified:annual': process.env.STRIPE_VERIFIED_ANNUAL_PRICE_ID,
    'featured:monthly': process.env.STRIPE_FEATURED_MONTHLY_PRICE_ID,
    'featured:annual': process.env.STRIPE_FEATURED_ANNUAL_PRICE_ID,
  };
  return map[`${tier}:${interval}`];
}

// POST /api/subscription/checkout
// Body: { tier: 'verified'|'featured', interval: 'monthly'|'annual', providerId: string }
// Requires the caller to be authenticated and own the provider listing.
export async function POST(request: NextRequest) {
  try {
    // Auth check — caller must be signed in
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const tier: string = body.tier?.trim().toLowerCase();
    const interval: string = body.interval?.trim().toLowerCase();
    const providerId: string = body.providerId?.trim();

    if (!['verified', 'featured'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier. Must be verified or featured.' }, { status: 400 });
    }
    if (!['monthly', 'annual'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval. Must be monthly or annual.' }, { status: 400 });
    }
    if (!providerId) {
      return NextResponse.json({ error: 'providerId is required.' }, { status: 400 });
    }

    // Verify the caller owns this provider listing
    const { data: provider } = await supabase
      .from('providers')
      .select('id, name, contact_email, stripe_customer_id, subscription_tier, subscription_status')
      .eq('id', providerId)
      .eq('claimed_by', user.id)
      .maybeSingle();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found or you do not own this listing.' },
        { status: 403 },
      );
    }

    const priceId = getPriceId(tier, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: 'Subscription pricing is not configured. Please contact support.' },
        { status: 503 },
      );
    }

    const stripe = getStripe();

    // If the provider already has a Stripe customer, reuse it
    let customerId: string | undefined = provider.stripe_customer_id || undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: provider.contact_email || user.email || undefined,
        name: provider.name,
        metadata: {
          provider_id: provider.id,
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Persist the new customer ID immediately so subsequent calls reuse it
      const admin = createAdminClient();
      await admin
        .from('providers')
        .update({ stripe_customer_id: customerId })
        .eq('id', provider.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          product: 'cyberbench_subscription',
          provider_id: provider.id,
          tier,
          interval,
        },
      },
      metadata: {
        product: 'cyberbench_subscription',
        provider_id: provider.id,
        tier,
        interval,
      },
      success_url: `${SITE_URL}/dashboard?subscription=success&tier=${tier}`,
      cancel_url: `${SITE_URL}/dashboard?subscription=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[subscription checkout] error:', err);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 500 },
    );
  }
}
