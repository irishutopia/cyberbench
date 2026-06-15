import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, CheckCircle, ShieldCheck, Crown, Flame, ArrowRight } from 'lucide-react';
import SubmissionForm from './SubmissionForm';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `List Your Company — ${SITE_NAME}`,
  description: 'Submit your cybersecurity company to be listed on CyberBench, the trusted directory for finding security service providers.',
};

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceNote: 'always',
    icon: CheckCircle,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    borderClass: 'border-border',
    features: ['Directory listing', 'Service category tags', 'Contact form for leads', 'State & city placement'],
  },
  {
    id: 'verified',
    name: 'Verified',
    price: '$99/mo',
    priceNote: 'or $990/yr',
    icon: ShieldCheck,
    iconColor: 'text-[var(--cyan)]',
    iconBg: 'bg-[var(--cyan)]/10',
    borderClass: 'border-[var(--cyan)]/30',
    features: ['Everything in Basic', 'Verified badge', 'Category placement boost', 'Profile analytics', 'Lead notifications'],
  },
  {
    id: 'featured',
    name: 'Featured',
    price: '$299/mo',
    priceNote: 'or $2,990/yr',
    icon: Crown,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10',
    borderClass: 'border-amber-400/30',
    features: ['Everything in Verified', 'Top-of-category placement', 'Homepage rotation', 'Priority Get Matched routing'],
  },
];

export default function ListYourCompanyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--cyan)]/10">
          <Building2 className="h-7 w-7 text-[var(--cyan)]" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">List Your Company</h1>
        <p className="mt-3 text-muted-foreground">
          Join the CyberBench directory and get discovered by organizations looking for
          cybersecurity service providers. Free to list — takes under 2 minutes.
        </p>
      </div>

      {/* Tier ladder */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Listing tiers</h2>
          <Link href="/pricing" className="text-xs text-[var(--cyan)] hover:underline">
            Compare all plans →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`rounded-xl border ${tier.borderClass} bg-card p-4`}
              >
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${tier.iconBg}`}>
                  <Icon className={`h-4 w-4 ${tier.iconColor}`} />
                </div>
                <h3 className="mt-2 font-semibold text-foreground">{tier.name}</h3>
                <p className="text-sm font-bold text-foreground">{tier.price}</p>
                <p className="text-xs text-muted-foreground">{tier.priceNote}</p>
                <ul className="mt-3 space-y-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-[var(--cyan)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Start with a free Basic listing. Upgrade to Verified or Featured anytime from your dashboard after approval.
        </p>
      </div>

      {/* Founding Provider upsell */}
      <Link
        href="/founding"
        className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 transition-colors hover:bg-amber-400/10"
      >
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Want locked-in pricing &amp; founding status?
            </p>
            <p className="text-xs text-muted-foreground">
              Become a Founding Provider — first 25 firms only, $499/yr (Featured-equivalent perks, price locked forever).
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-amber-400" />
      </Link>

      <SubmissionForm />
    </main>
  );
}
