import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { daysUntil } from '@/lib/founding-renewal';
import RenewalActions from './RenewalActions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Founding Renewals — Admin' };

export default async function FoundingRenewalsPage() {
  const admin = createAdminClient();
  const { data: providers } = await admin
    .from('providers')
    .select('id, name, contact_email, founding_purchased_at, founding_term_ends_at, founding_renewal_status, founding_reminder_60_sent_at, founding_reminder_30_sent_at, founding_overdue_sent_at')
    .eq('is_founding', true)
    .order('founding_term_ends_at', { ascending: true });

  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Founding Renewals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Annual terms paid by one-time Stripe checkout. Contact the provider and arrange renewal separately before extending the term.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-card">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Term end</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reminders</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>{providers?.map((provider) => {
            const remaining = provider.founding_term_ends_at ? daysUntil(provider.founding_term_ends_at, now) : null;
            return <tr key={provider.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3"><p className="font-medium text-foreground">{provider.name}</p><p className="text-xs text-muted-foreground">{provider.contact_email || 'No contact email'}</p></td>
              <td className="px-4 py-3 text-muted-foreground">{provider.founding_term_ends_at ? <>{new Date(provider.founding_term_ends_at).toLocaleDateString('en-US', { timeZone: 'UTC' })}<p className={remaining !== null && remaining < 0 ? 'text-xs text-red-400' : 'text-xs'}>{remaining !== null && remaining < 0 ? `${Math.abs(remaining)} days overdue` : `${remaining} days remaining`}</p></> : 'Migration required'}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${provider.founding_renewal_status === 'renewal_due' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{provider.founding_renewal_status || 'active'}</span></td>
              <td className="px-4 py-3 text-xs text-muted-foreground">60d {provider.founding_reminder_60_sent_at ? '✓' : '—'} · 30d {provider.founding_reminder_30_sent_at ? '✓' : '—'} · overdue {provider.founding_overdue_sent_at ? '✓' : '—'}</td>
              <td className="px-4 py-3"><RenewalActions providerId={provider.id} /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
