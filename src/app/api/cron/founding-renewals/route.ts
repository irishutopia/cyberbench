import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { daysUntil, renewalStage } from '@/lib/founding-renewal';

export const dynamic = 'force-dynamic';

type FoundingProvider = {
  id: string;
  name: string;
  contact_email: string | null;
  founding_term_ends_at: string | null;
  founding_reminder_60_sent_at: string | null;
  founding_reminder_30_sent_at: string | null;
  founding_overdue_sent_at: string | null;
};

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('providers')
    .select('id, name, contact_email, founding_term_ends_at, founding_reminder_60_sent_at, founding_reminder_30_sent_at, founding_overdue_sent_at')
    .eq('is_founding', true)
    .not('founding_term_ends_at', 'is', null)
    .lte('founding_term_ends_at', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('[founding renewals] query failed:', error);
    return NextResponse.json({ error: 'Renewal query failed' }, { status: 500 });
  }

  const now = new Date();
  const due = ((data || []) as FoundingProvider[])
    .map((provider) => ({ provider, stage: renewalStage(provider, now) }))
    .filter((item) => item.stage !== 'none');

  if (due.length === 0) return NextResponse.json({ checked: data?.length || 0, notified: 0 });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('[founding renewals] RESEND_API_KEY not set');
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 });
  }

  const rows = due.map(({ provider, stage }) => {
    const remaining = daysUntil(provider.founding_term_ends_at!, now);
    return `<li><strong>${escapeHtml(provider.name)}</strong> — ${stage === 'overdue' ? `${Math.abs(remaining)} day(s) overdue` : `${remaining} day(s) remaining`} — ${escapeHtml(provider.contact_email || 'no contact email')} — term ends ${new Date(provider.founding_term_ends_at!).toISOString().slice(0, 10)}</li>`;
  }).join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({
      from: 'CyberBench <notifications@viso.group>',
      to: (process.env.ADMIN_EMAILS || 'jwilson@viso.group').split(',').map((email) => email.trim()),
      subject: `CyberBench Founding renewals — ${due.length} action${due.length === 1 ? '' : 's'} due`,
      html: `<h2>Founding renewal actions</h2><ul>${rows}</ul><p>Review these terms in CyberBench Admin → Founding Renewals. Renewal is handled separately because the original $499 payment is not a subscription.</p>`,
    }),
  });

  if (!response.ok) {
    console.error('[founding renewals] reminder email failed:', response.status, await response.text());
    return NextResponse.json({ error: 'Reminder email failed' }, { status: 502 });
  }

  const sentAt = now.toISOString();
  for (const { provider, stage } of due) {
    const update = stage === '60_day'
      ? { founding_reminder_60_sent_at: sentAt }
      : stage === '30_day'
        ? { founding_reminder_30_sent_at: sentAt }
        : { founding_overdue_sent_at: sentAt, founding_renewal_status: 'renewal_due' };
    const { error: updateError } = await admin.from('providers').update(update).eq('id', provider.id);
    if (updateError) console.error(`[founding renewals] failed to record ${stage} for ${provider.id}:`, updateError);
  }

  return NextResponse.json({ checked: data?.length || 0, notified: due.length });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]!);
}
