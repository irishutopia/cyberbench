# Founding Provider Program — Phase A (Forge build notes)

Monetization MVP for CyberBench. Sells the "Founding Verified Provider" offer
($499/yr, first 25 firms) via Stripe one-time checkout. On payment, the
provider's listing is flagged `is_founding` + `is_verified` and floats to the
top of category/listing pages.

**Status:** built + `npm run build` passes (exit 0). NOT deployed. NOT committed.

---

## 1. Database migration (RUN THIS FIRST)

Run `supabase/migrations/003_founding_provider.sql` in the **Supabase SQL Editor**
for project `rsjvlljmswumgsymjmhy` (the `db.*` hostname doesn't resolve for direct
psql). It's idempotent (`IF NOT EXISTS` guards), safe to re-run.

Adds to `providers`: `is_founding`, `is_verified`, `is_featured` (all boolean,
default false), `founding_purchased_at`, `stripe_customer_id`, `stripe_session_id`,
plus indexes and a unique index on `stripe_session_id` (idempotency).

---

## 2. Stripe dashboard setup (Jeremy — needs your input)

In Stripe (TEST mode for now):

1. **Create the product + price:**
   - Product: "CyberBench Founding Provider"
   - Price: **$499.00 USD, one-time** (not recurring — we charge annually as a
     one-time charge for now to avoid subscription churn/refund complexity).
   - Copy the **Price ID** (`price_...`) → this is `STRIPE_FOUNDING_PRICE_ID`.

2. **Webhook endpoint:**
   - URL: `https://cyberbench.net/api/founding/webhook`
   - Event: `checkout.session.completed`
   - Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

3. **API keys:** Settings → API keys → copy the **secret key** (`sk_test_...`)
   → `STRIPE_SECRET_KEY`, and **publishable key** (`pk_test_...`) →
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

> **Going live:** swap all `sk_test_/pk_test_/whsec_` for live equivalents, and
> create a live-mode product/price → new live `STRIPE_FOUNDING_PRICE_ID`.

---

## 3. Env vars to set in Vercel

| Var | Where | Notes |
|-----|-------|-------|
| `STRIPE_SECRET_KEY` | Vercel | TEST `sk_test_...` now; LIVE later. Server-only. |
| `STRIPE_WEBHOOK_SECRET` | Vercel | `whsec_...` from the webhook endpoint. Server-only. |
| `STRIPE_FOUNDING_PRICE_ID` | Vercel | `price_...` of the $499 founding price. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Vercel | `pk_test_/pk_live_...`. (Reserved — not strictly required by current flow, redirect uses session URL.) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Already needed by existing admin flows; webhook uses it to flag providers. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Already set (existing). |

> `.env.local` in this repo holds **placeholder build values only** (gitignored,
> not real secrets). Replace locally with real TEST keys if you want to exercise
> checkout end-to-end before deploy.

Checkout/webhook return `503 "Payments not configured"` until
`STRIPE_SECRET_KEY` + `STRIPE_FOUNDING_PRICE_ID` are set — so it fails safe.

---

## 4. Files created / changed

**Created**
- `supabase/migrations/003_founding_provider.sql` — schema flags + indexes
- `src/lib/stripe.ts` — lazy Stripe client, config check, offer constants ($499/25)
- `src/app/api/founding/checkout/route.ts` — POST → Stripe Checkout Session
- `src/app/api/founding/webhook/route.ts` — Stripe webhook → flag provider
- `src/app/founding/page.tsx` — landing page w/ scarcity counter + pricing
- `src/app/founding/FoundingCheckoutButton.tsx` — client checkout button
- `src/app/founding/success/page.tsx` — post-payment success page
- `src/app/list-your-company/founding/page.tsx` — alias → `/founding`

**Changed**
- `src/lib/types.ts` — added `is_founding/is_verified/is_featured` to Provider
- `src/lib/data.ts` — `getFoundingStats()` (scarcity count), `placementSort()`,
  DB-provider fetch + merge so real/founding providers appear and sort to top
- `src/components/providers/ProviderCard.tsx` — Founding (crown) + Verified badges
- `src/app/list-your-company/page.tsx` — founding upsell banner
- `package.json` / `package-lock.json` — added `stripe`, `@stripe/stripe-js`

---

## 5. How placement weighting works

`placementSort()` in `data.ts` orders listings: founding (100) > verified (10)
> featured (1) > rest, then alphabetical. Applied in `getProviders()` and
`getProvidersByCategory()`, so founding+verified providers top their categories.

Note: listing pages previously rendered from **seed data** only. They now also
pull real `active`/`claimed` providers from Supabase and merge (DB wins on slug),
so paid founding members actually show up. Falls back to seed data if Supabase
is unreachable — existing behavior preserved.

`is_featured` is wired through the sort/types/schema but unused for now
(reserved for Phase 2 featured placement).

---

## 6. Test plan (after env + migration)

1. Set TEST Stripe keys + price id locally in `.env.local`, `npm run dev`.
2. Visit `/founding` → counter shows "25 of 25 spots left" (0 founding yet).
3. Click checkout → Stripe test card `4242 4242 4242 4242` → completes.
4. Forward webhook locally: `stripe listen --forward-to localhost:3000/api/founding/webhook`
   (gives you the `whsec_` for `STRIPE_WEBHOOK_SECRET`).
5. Confirm the provider row flips `is_founding=true, is_verified=true` and the
   counter decrements; card shows Founding + Verified badges and sorts to top.

---

## 7. Needs Jeremy / open items

- **Create the Stripe product/price + webhook** (section 2) — only Jeremy can do
  this in the dashboard; I can't.
- **Checkout currently has no listing-picker UI.** The button calls checkout with
  an empty body, so it works as a generic "buy founding" flow; if the buyer has no
  matching listing yet, the webhook emails admin to attach the flag manually.
  If you want buyers to select/confirm their existing listing before paying, that's
  a small follow-up (pass `providerSlug` from a claim/lookup step).
- **Live keys** before real charges (section 2 going-live note).
- Pricing model is **one-time $499** (not a recurring subscription) per the
  playbook — intentional. Renewal handling is a future concern.
