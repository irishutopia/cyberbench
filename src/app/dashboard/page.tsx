import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { Eye, MessageSquare, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Provider Dashboard',
};

export default async function DashboardPage() {
  const supabase = createServerClient();
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

  return (
    <div className="space-y-6">
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
      <div className="grid gap-4 sm:grid-cols-3">
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
            <div className="rounded-lg bg-purple-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Listing Status</p>
              <p className="text-2xl font-bold text-foreground capitalize">{provider.status}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tier: {provider.tier}
          </p>
        </div>
      </div>

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
        </div>
      </div>
    </div>
  );
}
