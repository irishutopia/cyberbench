import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

// Stripe webhook for the Founding Provider Program.
// Listens for checkout.session.completed and flags the provider
// is_founding = true, is_verified = true, status = 'active'.
//
// IMPORTANT: signature verification needs the RAW request body, so we
// read request.text() (not request.json()).

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[founding webhook] STRIPE_WEBHOOK_SECRET not set');
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
    console.error('[founding webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    // Acknowledge other events so Stripe stops retrying.
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Only act on our founding product, and only when actually paid.
  if (session.metadata?.product !== 'founding_provider') {
    return NextResponse.json({ received: true });
  }
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  const providerId = session.metadata?.provider_id || '';
  const providerSlug = session.metadata?.provider_slug || '';
  const email =
    session.customer_details?.email || session.customer_email || null;

  try {
    const admin = createAdminClient();

    const update = {
      is_founding: true,
      is_verified: true,
      status: 'active' as const,
      founding_purchased_at: new Date().toISOString(),
      stripe_customer_id:
        typeof session.customer === 'string' ? session.customer : null,
      stripe_session_id: session.id,
      updated_at: new Date().toISOString(),
    };

    let matched = false;

    if (providerId) {
      const { error, count } = await admin
        .from('providers')
        .update(update, { count: 'exact' })
        .eq('id', providerId);
      if (!error && count) matched = true;
    }

    if (!matched && providerSlug) {
      const { error, count } = await admin
        .from('providers')
        .update(update, { count: 'exact' })
        .eq('slug', providerSlug);
      if (!error && count) matched = true;
    }

    if (!matched) {
      // No listing yet (e.g. paid before submitting). Log loudly so
      // Spark/Jeremy can attach the founding flag manually.
      console.warn(
        `[founding webhook] PAID but no provider matched. session=${session.id} email=${email} company=${session.metadata?.company_name}`
      );
      await notifyAdminUnmatched(session, email);
    }

    return NextResponse.json({ received: true, matched });
  } catch (err) {
    console.error('[founding webhook] processing error:', err);
    // Return 500 so Stripe retries.
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}

async function notifyAdminUnmatched(
  session: Stripe.Checkout.Session,
  email: string | null
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'CyberBench <notifications@viso.group>',
        to: process.env.ADMIN_EMAILS || 'jwilson@viso.group',
        subject: 'Founding Provider paid — needs manual listing match',
        html: `
          <h2>Founding payment received (no listing matched)</h2>
          <p><strong>Email:</strong> ${email || 'unknown'}</p>
          <p><strong>Company:</strong> ${session.metadata?.company_name || 'unknown'}</p>
          <p><strong>Stripe session:</strong> ${session.id}</p>
          <p>Attach is_founding/is_verified to their listing in admin.</p>
        `,
      }),
    });
  } catch (err) {
    console.error('[founding webhook] admin notify failed:', err);
  }
}
