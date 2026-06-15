'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, Crown, Star, Zap, BarChart2, Bell, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    badge: null,
    monthly: 0,
    annual: 0,
    annualMonthly: 0,
    description: 'Get your company listed in the directory and start attracting buyers.',
    icon: Star,
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted',
    borderClass: 'border-border',
    ctaLabel: 'List Your Company',
    ctaHref: '/list-your-company',
    ctaClass:
      'w-full rounded-lg border border-border py-3 text-sm font-semibold text-foreground hover:border-[var(--cyan)]/50 hover:text-[var(--cyan)] transition-colors',
    features: [
      'Self-serve directory listing',
      'Basic company profile',
      'Appears in search & browse',
      'Free forever',
    ],
    notIncluded: [
      'Verified badge',
      'Category placement boost',
      'Profile analytics',
      'Lead notifications',
      'Priority Get Matched routing',
    ],
  },
  {
    id: 'verified',
    name: 'Verified',
    badge: 'Most Popular',
    monthly: 99,
    annual: 990,
    annualMonthly: 82.5,
    description: 'Build buyer trust and appear above free listings in your service categories.',
    icon: ShieldCheck,
    iconColor: 'text-[var(--cyan)]',
    iconBg: 'bg-[var(--cyan)]/10',
    borderClass: 'border-[var(--cyan)]/40',
    ctaLabel: 'Upgrade to Verified',
    ctaHref: '/dashboard',
    ctaClass:
      'w-full rounded-lg border border-[var(--cyan)] bg-[var(--cyan)]/10 py-3 text-sm font-semibold text-[var(--cyan)] hover:bg-[var(--cyan)] hover:text-[var(--navy)] transition-colors',
    features: [
      'Everything in Basic',
      'Verified Provider badge',
      'Category placement (above Basic)',
      'Profile analytics dashboard',
      'Lead notification emails',
      'Get Matched eligibility',
    ],
    notIncluded: [
      'Top-of-category placement',
      'Homepage rotation',
      'Priority Get Matched routing',
    ],
  },
  {
    id: 'featured',
    name: 'Featured',
    badge: 'Best Visibility',
    monthly: 299,
    annual: 2990,
    annualMonthly: 249.17,
    description: 'Dominate your categories and be first in line when buyers are ready to choose.',
    icon: Crown,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10',
    borderClass: 'border-amber-400/40',
    ctaLabel: 'Upgrade to Featured',
    ctaHref: '/dashboard',
    ctaClass:
      'w-full rounded-lg border border-amber-400 bg-amber-400/10 py-3 text-sm font-semibold text-amber-400 hover:bg-amber-400 hover:text-[var(--navy)] transition-colors',
    features: [
      'Everything in Verified',
      'Top-of-category placement',
      'Homepage rotation (featured spotlight)',
      'Priority Get Matched routing',
      'Richer profile with enhanced media',
      'First dibs on qualified buyer leads',
    ],
    notIncluded: [],
  },
];

const COMPARISON_ROWS = [
  { label: 'Directory listing', basic: true, verified: true, featured: true },
  { label: 'Verified badge', basic: false, verified: true, featured: true },
  { label: 'Category placement boost', basic: false, verified: 'Above Basic', featured: 'Top of category' },
  { label: 'Profile analytics', basic: false, verified: true, featured: true },
  { label: 'Lead notifications', basic: false, verified: true, featured: true },
  { label: 'Get Matched routing', basic: false, verified: 'Standard', featured: 'Priority' },
  { label: 'Homepage rotation', basic: false, verified: false, featured: true },
  { label: 'Richer profile', basic: false, verified: false, featured: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === false) return <span className="text-muted-foreground/40">—</span>;
  if (value === true) return <Check className="mx-auto h-4 w-4 text-[var(--cyan)]" />;
  return <span className="text-sm text-foreground">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Pricing for every stage
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Start free. Upgrade when you're ready for more visibility, verified trust signals,
          and qualified buyer leads.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              !annual ? 'bg-[var(--cyan)] text-[var(--navy)]' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              annual ? 'bg-[var(--cyan)] text-[var(--navy)]' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
            <span className="rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs font-semibold text-green-400">
              Save ~17%
            </span>
          </button>
        </div>
      </section>

      {/* Tier cards */}
      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const price = annual && tier.annual > 0 ? tier.annualMonthly : tier.monthly;
          const priceLabel = tier.monthly === 0 ? 'Free' : `$${price.toLocaleString('en-US', { minimumFractionDigits: price % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 })}/mo`;
          const subLabel = annual && tier.annual > 0 ? `$${tier.annual}/yr billed annually` : tier.monthly > 0 ? 'billed monthly' : null;

          return (
            <Card key={tier.id} className={`relative border ${tier.borderClass} bg-card`}>
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    tier.id === 'verified'
                      ? 'bg-[var(--cyan)] text-[var(--navy)]'
                      : 'bg-amber-400 text-[var(--navy)]'
                  }`}>
                    {tier.badge}
                  </span>
                </div>
              )}
              <CardContent className="p-6">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${tier.iconBg}`}>
                  <Icon className={`h-5 w-5 ${tier.iconColor}`} />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">{tier.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>

                <div className="mt-5">
                  <p className="text-3xl font-bold text-foreground">{priceLabel}</p>
                  {subLabel && <p className="mt-0.5 text-xs text-muted-foreground">{subLabel}</p>}
                </div>

                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan)]" />
                      {f}
                    </li>
                  ))}
                  {tier.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through">
                      <span className="mt-0.5 h-4 w-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {tier.id === 'basic' ? (
                    <Link href={tier.ctaHref} className={tier.ctaClass + ' block text-center'}>
                      {tier.ctaLabel}
                    </Link>
                  ) : (
                    <Link
                      href={`${tier.ctaHref}?upgrade=${tier.id}&interval=${annual ? 'annual' : 'monthly'}`}
                      className={tier.ctaClass + ' block text-center'}
                    >
                      {tier.ctaLabel}
                      <ArrowRight className="ml-1.5 inline h-4 w-4" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Value props */}
      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          {
            icon: BarChart2,
            title: 'Buyer-intent traffic',
            body: 'Our free ThreatScope scan funnel sends mid-market buyers who just discovered a security gap directly to matching providers.',
          },
          {
            icon: Zap,
            title: 'Get Matched engine',
            body: 'Buyers submit a request and our system routes them to the best-fit providers. Verified and Featured providers rank first.',
          },
          {
            icon: Bell,
            title: 'Real-time lead alerts',
            body: 'Get notified the moment a buyer contacts you or matches with your listing — no waiting, no manual checking.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--cyan)]/10">
                <Icon className="h-5 w-5 text-[var(--cyan)]" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          );
        })}
      </section>

      {/* Comparison table */}
      <section className="mt-20">
        <h2 className="text-center text-2xl font-bold text-foreground">Full feature comparison</h2>
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 text-left text-muted-foreground font-medium">Feature</th>
                <th className="px-6 py-4 text-center text-foreground font-semibold">Basic</th>
                <th className="px-6 py-4 text-center text-[var(--cyan)] font-semibold">Verified</th>
                <th className="px-6 py-4 text-center text-amber-400 font-semibold">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="hover:bg-secondary/20">
                  <td className="px-6 py-3 text-muted-foreground">{row.label}</td>
                  <td className="px-6 py-3 text-center"><Cell value={row.basic} /></td>
                  <td className="px-6 py-3 text-center"><Cell value={row.verified} /></td>
                  <td className="px-6 py-3 text-center"><Cell value={row.featured} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Founding note */}
      <section className="mt-16 rounded-xl border border-border bg-card/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Founding Provider Program still open</span>
          {' '}— first 25 spots at $499/yr with Featured-equivalent perks, grandfathered forever.{' '}
          <Link href="/founding" className="text-[var(--cyan)] hover:underline">
            Learn more →
          </Link>
        </p>
      </section>

      {/* FAQ CTA */}
      <section className="mt-12 text-center">
        <p className="text-muted-foreground">
          Questions about which plan is right for you?{' '}
          <a href="mailto:jwilson@viso.group" className="text-[var(--cyan)] hover:underline">
            Email us
          </a>
        </p>
      </section>
    </main>
  );
}
