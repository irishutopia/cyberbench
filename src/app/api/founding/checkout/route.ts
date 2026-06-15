import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { getFoundingStats } from '@/lib/data';
import { SITE_URL } from '@/lib/constants';

// Creates a Stripe Checkout Session for the Founding Provider offer
// ($499 one-time, annual founding spot). On success Stripe fires
// checkout.session.completed → /api/founding/webhook flags the provider.
//
// Body: { providerSlug?: string, email?: string, companyName?: string }
//   - providerSlug: existing listing to upgrade (preferred path)
//   - email/companyName: for capture if no listing yet
export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payments are not configured yet. Please check back soon.' },
        { status: 503 }
      );
    }

    // Enforce scarcity server-side too — don't sell spot 26.
    const stats = await getFoundingStats();
    if (stats.remaining <= 0) {
      return NextResponse.json(
        { error: 'All founding spots are claimed. Join the waitlist instead.' },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const providerSlug: string | undefined = body.providerSlug?.trim() || undefined;
    const email: string | undefined = body.email?.trim()?.toLowerCase() || undefined;
    const companyName: string | undefined = body.companyName?.trim() || undefined;

    // Resolve provider id if a slug was supplied (so the webhook can
    // flag the exact listing). Optional — new signups may not have one yet.
    let providerId: string | undefined;
    let providerEmail = email;
    if (providerSlug) {
      try {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from('providers')
          .select('id, contact_email')
          .eq('slug', providerSlug)
          .maybeSingle();
        if (data) {
          providerId = data.id;
          providerEmail = providerEmail || data.contact_email || undefined;
        }
      } catch {
        /* non-fatal — proceed without provider id */
      }
    }

    const stripe = getStripe();
    const priceId = process.env.STRIPE_FOUNDING_PRICE_ID!;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: providerEmail,
      allow_promotion_codes: true,
      metadata: {
        product: 'founding_provider',
        provider_slug: providerSlug || '',
        provider_id: providerId || '',
        company_name: companyName || '',
      },
      success_url: `${SITE_URL}/founding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/founding?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Founding checkout error:', err);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 500 }
    );
  }
}
