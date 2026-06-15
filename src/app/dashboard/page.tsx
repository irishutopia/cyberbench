import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { Eye, MessageSquare, CheckCircle, AlertCircle, ArrowRight, Crown, ShieldCheck, Target } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import UpgradeTierSection from './UpgradeTierSection';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Provider Dashboard',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string; tier?: string; upgrade?: string; interval?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard');

  // Get claimed provider
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('claimed_by', user.id)
    .single();

  // Get leads count
  const { count: leadsCount } = provider
    ? await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', provider.id)
    : { count: 0 };

  // Get matched buyer count and recent matches
  const [{ count: matchCount }, { data: recentMatches }] = provider
    ? await Promise.all([
        supabase
          .from('match_lead_providers')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', provider.id),
        supabase
          .from('match_lead_providers')
          .select('created_at, match_requests(buyer_name, category_id, service_categories(name))')
          .eq('provider_id', provider.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
    : [{ count: 0 }, { data: [] }];

  // Get claim request status if no provider
  const { data: claimRequest } = !provider
    ? await supabase
        .from('claim_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  if (!provider && !claimRequest) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">No Listing Found</h1>
        <p className="mt-2 text-muted-foreground">
          You haven&apos;t claimed a provider listing yet. Find your company and claim it to access the dashboard.
        </p>
        <Link
          href="/claim"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--cyan)] px-6 py-3 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--cyan-light)]"
        >
          Claim Your Listing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (claimRequest && claimRequest.status === 'pending') {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
          <AlertCircle className="h-6 w-6 text-yellow-400" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Claim Under Review</h1>
        <p className="mt-2 text-muted-foreground">
          Your claim request is being reviewed by our team. You&apos;ll receive an email
          once it&apos;s approved. This typically takes 1-2 business days.
        </p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Your claim was reviewed. Please check your email for details or{' '}
          <Link href="/claim" className="text-[var(--cyan)] hover:underline">
            submit a new claim
          </Link>.
        </p>
      </div>
    );
  }

  const subTier: string | null = (provider as Record<string, unknown>).subscription_tier as string | null ?? null;
  const subStatus: string | null = (provider as Record<string, unknown>).subscription_status as string | null ?? null;
  const isFounding: boolean = !!(provider as Record<string, unknown>).is_founding;

  // Derive display tier label
  function tierLabel(): string {
    if (isFounding) return 'Founding';
    if (subTier === 'featured' && subStatus === 'active') return 'Featured';
    if (subTier === 'verified' && subStatus === 'active') return 'Verified';
    return 'Basic';
  }
  function tierIcon() {
    if (isFounding || (subTier === 'featured' && subStatus === 'active')) {
      return <Crown className="h-5 w-5 text-amber-400" />;
    }
    if (subTier === 'verified' && subStatus === 'active') {
      return <ShieldCheck className="h-5 w-5 text-[var(--cyan)]" />;
    }
    return <CheckCircle className="h-5 w-5 text-purple-400" />;
  }

  return (
    <div className="space-y-6">
      {/* Subscription success banner */}
      {params.subscription === 'success' && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
          <strong>Subscription activated!</strong> Your listing is now upgraded to{' '}
          <span className="font-semibold capitalize">{params.tier || 'a paid tier'}</span>. It may
          take a minute to reflect across the directory.
        </div>
      )}
      {params.subscription === 'canceled' && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
          Checkout was canceled. Your listing remains unchanged.
        </div>
      )}

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {provider.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your listing and view your leads.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--cyan)]/10 p-2">
              <Eye className="h-5 w-5 text-[var(--cyan)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profile Views</p>
              <p className="text-2xl font-bold text-foreground">—</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Analytics coming soon</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-foreground">{leadsCount || 0}</p>
            </div>
          </div>
          <Link
            href="/dashboard/leads"
            className="mt-2 inline-block text-xs text-[var(--cyan)] hover:underline"
          >
            View all leads →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${
              isFounding || subTier === 'featured'
                ? 'bg-amber-400/10'
                : subTier === 'verified'
                ? 'bg-[var(--cyan)]/10'
                : 'bg-purple-500/10'
            }`}>
              {tierIcon()}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Listing Tier</p>
              <p className="text-2xl font-bold text-foreground">{tierLabel()}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground capitalize">
            Status: {provider.status}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Buyer Matches</p>
              <p className="text-2xl font-bold text-foreground">{matchCount || 0}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Buyers matched to your listing</p>
        </div>
      </div>

      {/* Recent Buyer Matches */}
      {recentMatches && recentMatches.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Recent Buyer Matches</h2>
          <p className="mt-1 text-xs text-muted-foreground">Buyers who were matched to your listing via Get Matched</p>
          <div className="mt-4 space-y-2">
            {recentMatches.map((m) => {
              const mr = (m.match_requests as unknown) as {
                buyer_name: string;
                service_categories: { name: string } | null;
              } | null;
              const buyerFirst = mr?.buyer_name?.split(' ')[0] ?? '—';
              const category = mr?.service_categories?.name ?? '—';
              return (
                <div key={String(m.created_at)} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm">
                  <span className="text-foreground font-medium">{buyerFirst[0]}{'*'.repeat(Math.max(0, buyerFirst.length - 1))}</span>
                  <span className="text-muted-foreground">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade section — show for non-founding, non-featured providers */}
      {!isFounding && subTier !== 'featured' && (
        <UpgradeTierSection
          providerId={provider.id}
          currentTier={subTier}
          currentStatus={subStatus}
          isFounding={isFounding}
        />
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/profile"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-[var(--cyan)]/50 hover:text-foreground"
          >
            Edit Profile →
          </Link>
          <Link
            href="/dashboard/leads"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-[var(--cyan)]/50 hover:text-foreground"
          >
            View Leads →
          </Link>
          <Link
            href={`/providers/${provider.slug}`}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-[var(--cyan)]/50 hover:text-foreground"
            target="_blank"
          >
            View Public Profile →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-[var(--cyan)]/50 hover:text-foreground"
          >
            Compare Plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
