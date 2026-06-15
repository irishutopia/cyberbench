-- ============================================================
-- 005 — Subscription Pricing (post-founding tier ladder)
-- ============================================================
-- Adds subscription management columns to providers.
-- Keeps existing is_verified / is_featured flags (set by webhook).
-- Safe to re-run (IF NOT EXISTS / DO NOTHING guards).
-- ============================================================

-- Stripe subscription columns
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier        TEXT,      -- 'verified' | 'featured' | null
  ADD COLUMN IF NOT EXISTS subscription_status      TEXT,      -- 'active' | 'past_due' | 'canceled' | null
  ADD COLUMN IF NOT EXISTS subscription_interval    TEXT,      -- 'month' | 'year' | null
  ADD COLUMN IF NOT EXISTS current_period_end       TIMESTAMPTZ;

-- Index for webhook lookups by Stripe customer / subscription
CREATE INDEX IF NOT EXISTS idx_providers_stripe_customer
  ON providers (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_providers_stripe_subscription
  ON providers (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Index for directory ranking queries (featured > verified > basic)
CREATE INDEX IF NOT EXISTS idx_providers_tier_sort
  ON providers (subscription_tier, is_featured, is_verified);
