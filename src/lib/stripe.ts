import Stripe from 'stripe';

// Server-side Stripe client. Uses TEST keys for now — swap to live keys
// in Vercel env (STRIPE_SECRET_KEY) when ready to charge real cards.
//
// Lazily instantiated so that builds / pages that don't touch Stripe
// don't crash when the key is absent (e.g. local build without secrets).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  if (!_stripe) {
    _stripe = new Stripe(key, {
      // Pinned to the version bundled with the installed stripe SDK.
      apiVersion: '2026-05-27.dahlia',
      appInfo: { name: 'CyberBench', url: 'https://cyberbench.net' },
    });
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_FOUNDING_PRICE_ID;
}

// Founding Provider Program config
export const FOUNDING_PRICE_USD = 499;
export const FOUNDING_TOTAL_SPOTS = 25;
