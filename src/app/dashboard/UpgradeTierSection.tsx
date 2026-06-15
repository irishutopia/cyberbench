'use client';

import { useState } from 'react';
import { ShieldCheck, Crown, Check, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  providerId: string;
  currentTier: string | null;
  currentStatus: string | null;
  isFounding: boolean;
}

const TIERS = [
  {
    id: 'verified',
    name: 'Verified',
    monthlyPrice: 99,
    annualPrice: 990,
    annualMonthly: 82.5,
    icon: ShieldCheck,
    iconColor: 'text-[var(--cyan)]',
    iconBg: 'bg-[var(--cyan)]/10',
    borderClass: 'border-[var(--cyan)]/40',
    ctaClass: 'bg-[var(--cyan)]/10 border border-[var(--cyan)] text-[var(--cyan)] hover:bg-[var(--cyan)] hover:text-[var(--navy)]',
    features: ['Verified badge', 'Category placement boost', 'Profile analytics', 'Lead notifications'],
  },
  {
    id: 'featured',
    name: 'Featured',
    monthlyPrice: 299,
    annualPrice: 2990,
    annualMonthly: 249.17,
    icon: Crown,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10',
    borderClass: 'border-amber-400/40',
    ctaClass: 'bg-amber-400/10 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-[var(--navy)]',
    features: ['Everything in Verified', 'Top-of-category placement', 'Homepage rotation', 'Priority Get Matched routing'],
  },
];

export default function UpgradeTierSection({ providerId, currentTier, currentStatus, isFounding }: Props) {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Founding providers have featured-equivalent perks — no upgrade needed
  if (isFounding) {
    return (
      <div className="rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-6">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-[var(--cyan)]" />
          <h2 className="font-semibold text-foreground">Founding Provider</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re a founding member with Featured-equivalent perks, grandfathered at $499/yr.
          No further upgrade needed.
        </p>
      </div>
    );
  }

  const isActiveVerified = currentTier === 'verified' && currentStatus === 'active';
  const isActiveFeatured = currentTier === 'featured' && currentStatus === 'active';

  async function handleUpgrade(tier: string) {
    setError(null);
    setLoading(tier);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          interval: annual ? 'annual' : 'monthly',
          providerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Upgrade Your Listing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get more visibility and qualified buyer leads.
          </p>
        </div>
        {/* Billing toggle */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary p-0.5 text-xs">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              !annual ? 'bg-[var(--cyan)] text-[var(--navy)]' : 'text-muted-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              annual ? 'bg-[var(--cyan)] text-[var(--navy)]' : 'text-muted-foreground'
            }`}
          >
            Annual <span className="text-green-400">~17% off</span>
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const price = annual ? tier.annualMonthly : tier.monthlyPrice;
          const priceLabel = annual
            ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`
            : `$${price}/mo`;
          const subLabel = annual ? `$${tier.annualPrice}/yr billed annually` : 'billed monthly';

          const isCurrentActive =
            (tier.id === 'verified' && isActiveVerified) ||
            (tier.id === 'featured' && isActiveFeatured);

          return (
            <div
              key={tier.id}
              className={`rounded-xl border ${tier.borderClass} bg-secondary/20 p-5`}
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tier.iconBg}`}>
                <Icon className={`h-4 w-4 ${tier.iconColor}`} />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{tier.name}</h3>
              <div className="mt-1">
                <span className="text-2xl font-bold text-foreground">{priceLabel}</span>
                <p className="text-xs text-muted-foreground">{subLabel}</p>
              </div>
              <ul className="mt-4 space-y-1.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-[var(--cyan)]" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentActive ? (
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2.5">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Current plan</span>
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={!!loading}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${tier.ctaClass}`}
                >
                  {loading === tier.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Upgrade to {tier.name}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Secure checkout via Stripe. Cancel anytime.{' '}
        <a href="/pricing" className="text-[var(--cyan)] hover:underline">
          Compare all plans →
        </a>
      </p>
    </div>
  );
}
