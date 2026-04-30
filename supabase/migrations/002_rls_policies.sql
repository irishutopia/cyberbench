-- ============================================================
-- RLS Policies: Allow public read access to directory data
-- ============================================================

-- Providers: anyone can read active providers
CREATE POLICY "Public can view active providers"
  ON providers FOR SELECT
  USING (status = 'active');

-- Service categories: anyone can read
CREATE POLICY "Public can view service categories"
  ON service_categories FOR SELECT
  USING (true);

-- Certifications: anyone can read
CREATE POLICY "Public can view certifications"
  ON certifications FOR SELECT
  USING (true);

-- Provider services (join table): anyone can read
CREATE POLICY "Public can view provider services"
  ON provider_services FOR SELECT
  USING (true);

-- Provider certifications (join table): anyone can read
CREATE POLICY "Public can view provider certifications"
  ON provider_certifications FOR SELECT
  USING (true);

-- Cities: anyone can read
CREATE POLICY "Public can view cities"
  ON cities FOR SELECT
  USING (true);

-- Contact submissions: only service_role can insert/read
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Claim requests: anyone can submit
CREATE POLICY "Anyone can submit claim request"
  ON claim_requests FOR INSERT
  WITH CHECK (true);

-- ThreatScope referrals: only service_role
CREATE POLICY "Service role manages referrals"
  ON threatscope_referrals FOR ALL
  USING (auth.role() = 'service_role');
