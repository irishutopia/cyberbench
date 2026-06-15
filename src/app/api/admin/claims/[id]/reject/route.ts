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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await admin
      .from('claim_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to reject claim' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reject claim error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
