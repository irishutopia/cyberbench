-- Allow signed-in vendors to see their own claim requests.
-- Matches by user_id (if they were logged in when claiming) OR work_email
-- (for email-only anonymous claims — matched after sign-in via magic link).
CREATE POLICY "Vendors can view their own claims"
  ON claim_requests FOR SELECT
  USING (
    user_id = auth.uid()
    OR work_email = (auth.jwt() ->> 'email')
  );
