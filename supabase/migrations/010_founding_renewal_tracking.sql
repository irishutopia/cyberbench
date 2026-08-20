-- ============================================================
-- 010 — Founding annual-term and renewal tracking
-- ============================================================

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS founding_term_ends_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS founding_renewal_status     TEXT,
  ADD COLUMN IF NOT EXISTS founding_reminder_60_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS founding_reminder_30_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS founding_overdue_sent_at     TIMESTAMPTZ;

-- Existing paid founding providers receive the originally promised one-year
-- term measured from their recorded purchase date.
UPDATE providers
SET founding_term_ends_at = founding_purchased_at + INTERVAL '1 year',
    founding_renewal_status = CASE
      WHEN founding_purchased_at + INTERVAL '1 year' < NOW() THEN 'renewal_due'
      ELSE 'active'
    END
WHERE is_founding = true
  AND founding_purchased_at IS NOT NULL
  AND founding_term_ends_at IS NULL;

ALTER TABLE providers
  DROP CONSTRAINT IF EXISTS providers_founding_renewal_status_check;

ALTER TABLE providers
  ADD CONSTRAINT providers_founding_renewal_status_check
  CHECK (founding_renewal_status IN ('active', 'renewal_due', 'renewed', 'expired'));

CREATE INDEX IF NOT EXISTS idx_providers_founding_term_end
  ON providers (founding_term_ends_at)
  WHERE is_founding = true;
