import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'jwilson@viso.group').split(',').map((e) => e.trim().toLowerCase());

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const admin = createAdminClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, provider_id } = body;

    // Update claim status
    const { error: claimError } = await admin
      .from('claim_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
      })
      .eq('id', id);

    if (claimError) {
      return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
    }

    // Determine which provider to claim — prefer the body, fall back to the
    // claim record (email-based claims won't pass provider_id/user_id).
    let targetProviderId: string | null = provider_id ?? null;
    if (!targetProviderId) {
      const { data: claim } = await admin
        .from('claim_requests')
        .select('provider_id')
        .eq('id', id)
        .single();
      targetProviderId = claim?.provider_id ?? null;
    }

    // Mark the provider claimed. user_id is optional — most claims are
    // submitted by email and have no linked auth user, which is fine.
    if (targetProviderId) {
      await admin
        .from('providers')
        .update({
          is_claimed: true,
          is_verified: true,
          claimed_by: user_id ?? null,
          claimed_at: new Date().toISOString(),
          // NOTE: deliberately do NOT touch `status` — it controls directory
          // visibility (getProviderBySlug filters status='active'). The
          // claimed/verified badges key off is_claimed / is_verified instead.
        })
        .eq('id', targetProviderId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Approve claim error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
