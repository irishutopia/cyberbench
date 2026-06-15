-- Allow vendors to SELECT their own claimed provider regardless of status.
-- The existing "Public can view active providers" covers directory pages;
-- this addition lets claimed_by = auth.uid() see their profile in /dashboard.
CREATE POLICY "Vendors can view their own provider"
  ON providers FOR SELECT
  USING (claimed_by = auth.uid());
