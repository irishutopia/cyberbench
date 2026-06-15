-- ============================================================
-- 007 — Provider-facing read policies (RLS gap fix)
-- ============================================================
-- match_lead_providers (006) and contact_submissions (001/002) are
-- RLS-enabled but only carry a service_role policy. The provider
-- dashboard reads both tables with the *user-authed* client
-- (createServerClient), so those reads silently returned 0 rows:
--   • dashboard "Buyer Matches" card + "Recent Buyer Matches"  -> match_lead_providers
--   • dashboard "Total Leads" card + /dashboard/leads list     -> contact_submissions
--
-- Both are the provider's OWN data. We scope each SELECT policy to
-- the claimed-provider ownership pattern used everywhere in the app:
--   providers.claimed_by = auth.uid()
-- (see dashboard/page.tsx, dashboard/leads/page.tsx, profile/page.tsx).
--
-- A provider can therefore see ONLY rows tied to a provider row they
-- have claimed — never all rows. Admin pages keep using the service
-- role (createAdminClient) and are unaffected.
--
-- NOTE: match_requests is intentionally NOT opened here. It holds
-- raw buyer PII (email, company, free-text need) and is gated for the
-- upcoming per-lead billing flow. The dashboard masks buyer identity
-- on purpose, so we keep buyers' contact data behind the service role.
-- ============================================================

-- Per-provider match tracking: a provider sees only their own match rows.
create policy "Providers can view their own match leads"
  on match_lead_providers
  for select
  using (
    provider_id in (
      select id from providers where claimed_by = auth.uid()
    )
  );

-- Inbound contact-form leads: a provider sees only their own leads.
create policy "Providers can view their own contact submissions"
  on contact_submissions
  for select
  using (
    provider_id in (
      select id from providers where claimed_by = auth.uid()
    )
  );
