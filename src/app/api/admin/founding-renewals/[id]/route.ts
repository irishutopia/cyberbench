import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerClient } from '@/lib/supabase/server';
import { foundingTermEnd } from '@/lib/founding-renewal';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'jwilson@viso.group')
  .split(',').map((email) => email.trim().toLowerCase());

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await request.json().catch(() => ({ action: '' }));
  if (action !== 'renew' && action !== 'expire') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (action === 'expire') {
    const { error } = await admin.from('providers')
      .update({ founding_renewal_status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', id).eq('is_founding', true);
    if (error) return NextResponse.json({ error: 'Could not update renewal' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data: provider, error: readError } = await admin.from('providers')
    .select('founding_term_ends_at').eq('id', id).eq('is_founding', true).maybeSingle();
  if (readError || !provider) {
    return NextResponse.json({ error: 'Founding provider not found' }, { status: 404 });
  }

  const currentEnd = provider.founding_term_ends_at
    ? new Date(provider.founding_term_ends_at)
    : new Date();
  const extensionBase = currentEnd > new Date() ? currentEnd : new Date();
  const { error } = await admin.from('providers').update({
    founding_term_ends_at: foundingTermEnd(extensionBase.toISOString()),
    founding_renewal_status: 'renewed',
    founding_reminder_60_sent_at: null,
    founding_reminder_30_sent_at: null,
    founding_overdue_sent_at: null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) return NextResponse.json({ error: 'Could not record renewal' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
