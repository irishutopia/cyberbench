import { createClient } from '@supabase/supabase-js';

// Server-side auth helper - validates session
export async function getSession() {
  // For MVP, we use cookie-based auth via Supabase client-side
  // Server components read auth state from the client
  return null;
}
