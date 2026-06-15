import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'jwilson@viso.group').split(',').map((e) => e.trim().toLowerCase());

export async function PATCH(
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

    const body = await request.json();
    const { status, ...rest } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    Object.assign(updates, rest);

    const { error } = await admin
      .from('providers')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin provider update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
