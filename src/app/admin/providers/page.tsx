import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';
import ProviderAdminActions from './ProviderAdminActions';

export const metadata: Metadata = {
  title: 'Manage Providers — Admin',
};

export default async function AdminProvidersPage() {
  const supabase = createAdminClient();

  const { data: providers } = await supabase
    .from('providers')
    .select('id, name, slug, status, tier, is_claimed, city, state_code, created_at')
    .order('name')
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manage Providers</h1>
        <span className="text-sm text-muted-foreground">{providers?.length || 0} providers</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
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
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    provider.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    provider.status === 'claimed' ? 'bg-[var(--cyan)]/10 text-[var(--cyan)]' :
                    provider.status === 'suspended' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {provider.status}
                  </span>
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
