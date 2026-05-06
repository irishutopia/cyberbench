import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';
import ProviderAdminActions from './ProviderAdminActions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manage Providers — Admin',
};

export default async function AdminProvidersPage() {
  const supabase = createAdminClient();

  const { data: providers } = await supabase
    .from('providers')
    .select('id, name, slug, status, tier, is_claimed, city, state_code, contact_email, meta_description, website, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  const draftCount = providers?.filter((p) => p.status === 'draft').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Manage Providers</h1>
          {draftCount > 0 && (
            <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
              {draftCount} pending
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">{providers?.length || 0} providers</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status / Flags</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Claimed</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers?.map((provider) => (
              <tr key={provider.id} className="border-b border-border last:border-0 hover:bg-card/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="font-medium text-foreground hover:text-[var(--cyan)]"
                    target="_blank"
                  >
                    {provider.name}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {provider.city ? `${provider.city}, ${provider.state_code}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      provider.status === 'active' ? 'bg-green-500/10 text-green-400' :
                      provider.status === 'claimed' ? 'bg-[var(--cyan)]/10 text-[var(--cyan)]' :
                      provider.status === 'suspended' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {provider.status}
                    </span>
                    {provider.meta_description?.includes('email_domain_mismatch') && (
                      <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400" title="Contact email domain does not match website">
                        ⚠️ email mismatch
                      </span>
                    )}
                    {provider.meta_description?.includes('website_unreachable') && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400" title="Website was not reachable at submission time">
                        🚫 site down
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {provider.contact_email || '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {provider.is_claimed ? '✓' : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <ProviderAdminActions
                    providerId={provider.id}
                    currentStatus={provider.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
