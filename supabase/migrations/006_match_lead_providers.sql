-- ============================================================
-- 006 — Per-Provider Match Tracking
-- ============================================================
-- Normalizes the matched_provider_ids array in match_requests
-- into a proper join table so we can surface per-provider
-- analytics, support lead notifications, and wire per-lead billing.
-- ============================================================

create table if not exists match_lead_providers (
  id                uuid primary key default gen_random_uuid(),
  match_request_id  uuid not null references match_requests(id) on delete cascade,
  provider_id       uuid not null references providers(id),
  created_at        timestamptz not null default now(),

  -- Reserved for per-lead billing (see cyberbench-after-25-plan.md)
  billing_status    text not null default 'unpaid',  -- 'unpaid' | 'charged' | 'waived'
  charged_at        timestamptz,
  amount_cents      int
);

create index if not exists match_lead_providers_provider_id_idx
  on match_lead_providers (provider_id);

create index if not exists match_lead_providers_match_request_id_idx
  on match_lead_providers (match_request_id);

-- RLS: mirror match_requests policy — service_role only
alter table match_lead_providers enable row level security;

create policy "service_role_all" on match_lead_providers
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Backfill existing match_requests into match_lead_providers
-- (unnest the matched_provider_ids array, one row per provider per request)
insert into match_lead_providers (match_request_id, provider_id, created_at)
select
  mr.id as match_request_id,
  unnested.provider_id,
  mr.created_at
from match_requests mr,
  lateral unnest(mr.matched_provider_ids) as unnested(provider_id)
where
  array_length(mr.matched_provider_ids, 1) > 0
on conflict do nothing;
