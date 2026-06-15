-- ============================================================
-- 003 — Founding Provider Program (monetization Phase A)
-- ============================================================
-- Adds flags that drive the "Founding Provider" offer:
--   is_founding  — paid founding member (first 25 firms)
--   is_verified  — verified badge (set true on founding purchase)
--   is_featured  — reserved for Phase 2 featured placement
--   founding_purchased_at / stripe_* — payment audit trail
--
-- NOTE: Run this in the Supabase SQL Editor for project
-- rsjvlljmswumgsymjmhy (the db.* hostname does not resolve for
-- direct psql). Safe to re-run (IF NOT EXISTS guards).
-- ============================================================

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS is_founding   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS founding_purchased_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id    TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id     TEXT;

-- Fast lookups for the scarcity counter (count of founding members)
-- and for placement sorting on category / listing pages.
CREATE INDEX IF NOT EXISTS idx_providers_founding
  ON providers (is_founding) WHERE is_founding = true;

CREATE INDEX IF NOT EXISTS idx_providers_placement
  ON providers (is_founding, is_verified, is_featured);

-- Idempotency: never double-apply a Stripe session to two providers.
CREATE UNIQUE INDEX IF NOT EXISTS uq_providers_stripe_session
  ON providers (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
