-- ============================================================
-- CyberBench MVP Schema
-- ============================================================

-- ENUMS
CREATE TYPE provider_status AS ENUM ('draft', 'active', 'claimed', 'suspended');
CREATE TYPE listing_tier AS ENUM ('free', 'professional', 'premium', 'enterprise');
CREATE TYPE company_size_served AS ENUM ('smb', 'mid_market', 'enterprise', 'all');
CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- SERVICE CATEGORIES
-- ============================================================

CREATE TABLE service_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,
  parent_id       UUID REFERENCES service_categories(id),
  sort_order      INT DEFAULT 0,
  meta_title      TEXT,
  meta_description TEXT,
  page_content    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CERTIFICATIONS
-- ============================================================

CREATE TABLE certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  issuing_body    TEXT,
  description     TEXT,
  icon            TEXT
);

-- ============================================================
-- PROVIDERS
-- ============================================================

CREATE TABLE providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  long_description TEXT,
  website         TEXT,
  logo_url        TEXT,
  founded_year    INT,
  headquarters    TEXT,
  employee_count  TEXT,
  city            TEXT,
  state           TEXT,
  state_code      TEXT,
  country         TEXT DEFAULT 'US',
  latitude        DECIMAL(10, 7),
  longitude       DECIMAL(10, 7),
  company_sizes_served company_size_served[] DEFAULT '{all}',
  industries_served TEXT[],
  status          provider_status DEFAULT 'active',
  tier            listing_tier DEFAULT 'free',
  is_claimed      BOOLEAN DEFAULT false,
  claimed_by      UUID,
  claimed_at      TIMESTAMPTZ,
  contact_email   TEXT,
  contact_phone   TEXT,
  meta_title      TEXT,
  meta_description TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  search_vector   TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(long_description, '')), 'C')
  ) STORED
);

CREATE INDEX idx_providers_search ON providers USING GIN (search_vector);
CREATE INDEX idx_providers_slug ON providers (slug);
CREATE INDEX idx_providers_status ON providers (status) WHERE status = 'active';
CREATE INDEX idx_providers_state ON providers (state_code);
CREATE INDEX idx_providers_city_state ON providers (city, state_code);

-- ============================================================
-- PROVIDER <-> CATEGORY (many-to-many)
-- ============================================================

CREATE TABLE provider_services (
  provider_id     UUID REFERENCES providers(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  is_primary      BOOLEAN DEFAULT false,
  PRIMARY KEY (provider_id, category_id)
);

CREATE INDEX idx_provider_services_category ON provider_services (category_id);
CREATE INDEX idx_provider_services_provider ON provider_services (provider_id);

-- ============================================================
-- PROVIDER <-> CERTIFICATIONS (many-to-many)
-- ============================================================

CREATE TABLE provider_certifications (
  provider_id     UUID REFERENCES providers(id) ON DELETE CASCADE,
  certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
  verified        BOOLEAN DEFAULT false,
  verified_at     TIMESTAMPTZ,
  PRIMARY KEY (provider_id, certification_id)
);

CREATE INDEX idx_provider_certs_provider ON provider_certifications (provider_id);

-- ============================================================
-- CITIES (for SEO city pages)
-- ============================================================

CREATE TABLE cities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  state           TEXT NOT NULL,
  state_code      TEXT NOT NULL,
  population      INT,
  latitude        DECIMAL(10, 7),
  longitude       DECIMAL(10, 7),
  meta_title      TEXT,
  meta_description TEXT,
  page_content    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cities_state ON cities (state_code);

-- ============================================================
-- CLAIM REQUESTS
-- ============================================================

CREATE TABLE claim_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     UUID REFERENCES providers(id) ON DELETE CASCADE,
  user_id         UUID,
  full_name       TEXT NOT NULL,
  job_title       TEXT NOT NULL,
  work_email      TEXT NOT NULL,
  phone           TEXT,
  verification_method TEXT,
  status          claim_status DEFAULT 'pending',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     TEXT
);

-- ============================================================
-- CONTACT/LEAD FORM SUBMISSIONS
-- ============================================================

CREATE TABLE contact_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     UUID REFERENCES providers(id),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  company         TEXT,
  phone           TEXT,
  message         TEXT,
  service_needed  TEXT,
  source_page     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- THREATSCOPE REFERRALS
-- ============================================================

CREATE TABLE threatscope_referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id         TEXT,
  domain_scanned  TEXT,
  risk_score      INT,
  landing_page    TEXT,
  provider_id     UUID REFERENCES providers(id),
  utm_source      TEXT DEFAULT 'threatscope',
  utm_medium      TEXT,
  utm_campaign    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_referrals_created ON threatscope_referrals (created_at);
