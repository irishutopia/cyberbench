import { Metadata } from 'next';
import { Users, CheckSquare, MessageSquare, Globe, TrendingUp, Shield } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Admin Dashboard — CyberBench',
};

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch stats
  const [
    { count: providerCount },
    { count: claimedCount },
    { count: pendingClaims },
    { count: leadsCount },
    { count: referralCount },
  ] = await Promise.all([
    supabase.from('providers').select('*', { count: 'exact', head: true }),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_claimed', true),
    supabase.from('claim_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('threatscope_referrals').select('*', { count: 'exact', head: true }),
  ]);

  // Recent activity
  const { data: recentLeads } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentClaims } = await supabase
    .from('claim_requests')
    .select('*, providers(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { label: 'Total Providers', value: providerCount || 0, icon: Users, color: 'text-[var(--cyan)]', bg: 'bg-[var(--cyan)]/10' },
    { label: 'Claimed Listings', value: claimedCount || 0, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Pending Claims', value: pendingClaims || 0, icon: CheckSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Total Leads', value: leadsCount || 0, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'ThreatScope Referrals', value: referralCount || 0, icon: Globe, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${stat.bg} p-2`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Claims */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Recent Claim Requests</h2>
          {recentClaims && recentClaims.length > 0 ? (
            <div className="mt-4 space-y-3">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{claim.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(claim.providers as { name: string } | null)?.name || 'Unknown'} — {claim.work_email}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    claim.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                    claim.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No claim requests yet.</p>
          )}
        </div>

        {/* Recent Leads */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Recent Leads</h2>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="mt-4 space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.email} {lead.company && `— ${lead.company}`}
                  </p>
                  {lead.message && (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{lead.message}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No leads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
