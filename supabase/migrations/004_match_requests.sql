-- match_requests: stores buyer intake submissions for the "Get Matched" feature.
-- Kept separate from contact_submissions so billing metadata can attach cleanly
-- once the per-lead charge ($50–$150) goes live (see cyberbench-after-25-plan.md).

create table if not exists match_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Buyer fields
  buyer_name      text not null,
  buyer_email     text not null,
  buyer_company   text,
  state_code      char(2) not null,
  budget          text,
  need            text not null,

  -- Category the buyer selected
  category_id     uuid references service_categories(id),

  -- IDs of matched providers (top-3 at match time)
  matched_provider_ids  uuid[] not null default '{}',

  -- TODO: BILLING — add billing_refs jsonb column when per-lead charges go live.
  -- billing_refs jsonb,
  -- billing_status text default 'unpaid', -- 'unpaid' | 'charged' | 'waived'

  constraint buyer_email_format check (buyer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Index for admin lookups by email and creation date
create index if not exists match_requests_buyer_email_idx on match_requests (buyer_email);
create index if not exists match_requests_created_at_idx  on match_requests (created_at desc);
create index if not exists match_requests_category_id_idx on match_requests (category_id);

-- RLS: allow service-role inserts (API), deny direct client reads
alter table match_requests enable row level security;

-- Only the service role (server-side API) may insert or read.
-- Providers and buyers do not access this table directly.
create policy "service_role_all" on match_requests
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
