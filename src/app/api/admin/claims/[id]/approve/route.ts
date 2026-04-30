import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'jwilson@viso.group').split(',').map((e) => e.trim().toLowerCase());

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
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

    // Update provider to claimed
    if (provider_id && user_id) {
      await admin
        .from('providers')
        .update({
          is_claimed: true,
          claimed_by: user_id,
          claimed_at: new Date().toISOString(),
          status: 'claimed',
        })
        .eq('id', provider_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Approve claim error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
