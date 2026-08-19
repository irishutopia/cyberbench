import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Target,
  Crown,
  Check,
  Flame,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getFoundingStats } from '@/lib/data';
import { FOUNDING_PRICE_USD } from '@/lib/stripe';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import FoundingCheckoutButton from './FoundingCheckoutButton';

export const metadata: Metadata = {
  title: `Become a Founding Provider — ${SITE_NAME}`,
  description:
    'Be one of the first 25 founding cybersecurity providers on CyberBench. Founding recognition, verified badge, profile build-out, and enhanced visibility — $499/year.',
  alternates: { canonical: `${SITE_URL}/founding` },
};

// Always reflect the live count.
export const dynamic = 'force-dynamic';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Verified Provider badge',
    body: 'Stand out with the trust signal buyers look for. Verified status is applied the moment you join.',
  },
  {
    icon: Crown,
    title: 'Enhanced category visibility',
    body: 'Founding members receive a visibility boost above free listings during the paid annual term.',
  },
  {
    icon: Sparkles,
    title: 'We build your profile',
    body: 'Our team writes and polishes your full provider profile — description, services, certs — so you look your best.',
  },
  {
    icon: Target,
    title: 'Matching consideration',
    body: 'Founding status is one of the relevance signals considered when eligible providers match a buyer request.',
  },
  {
    icon: Flame,
    title: 'Founding-member logo',
    body: 'A founding badge identifies your early participation while your founding membership remains active.',
  },
  {
    icon: TrendingUp,
    title: 'Buyer-intent discovery',
    body: 'Your eligible profile can be surfaced when buyers use the directory, free scan journey, or matching flow. Traffic and leads are not guaranteed.',
  },
];

export default async function FoundingPage() {
  const stats = await getFoundingStats();
  const soldOut = stats.remaining <= 0;
  const pct = Math.min(100, Math.round((stats.claimed / stats.total) * 100));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/10 px-4 py-1.5 text-sm font-medium text-[var(--cyan)]">
          <Flame className="h-4 w-4" />
          Founding Provider Program — first {stats.total} firms only
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Get listed in front of mid-market cybersecurity buyers — before anyone else.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          CyberBench helps organizations find and evaluate security providers.
          Founding members receive verified status, a founding badge while active,
          and enhanced visibility for the paid annual term at the founding rate.
        </p>

        {/* Scarcity counter */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="flex items-end justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Founding spots claimed
            </span>
            <span className="text-sm font-semibold text-[var(--cyan)]">
              {stats.claimed} / {stats.total}
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--cyan-light)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {soldOut ? (
              'All spots claimed'
            ) : (
              <>
                <span className="text-[var(--cyan)]">{stats.remaining}</span> of{' '}
                {stats.total} spots left
              </>
            )}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <FoundingCheckoutButton soldOut={soldOut} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          ${FOUNDING_PRICE_USD}/year · one-time charge · secure checkout via Stripe
        </p>
      </section>

      {/* Benefits */}
      <section className="mt-20">
        <h2 className="text-center text-2xl font-bold text-foreground">
          What founding members get
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--cyan)]/10">
                    <Icon className="h-5 w-5 text-[var(--cyan)]" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing card */}
      <section className="mt-20">
        <Card className="mx-auto max-w-lg border-[var(--cyan)]/40 bg-card shadow-lg shadow-[var(--cyan)]/5">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--cyan)]">
                  Founding Provider
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${FOUNDING_PRICE_USD}
                  </span>
                  <span className="text-muted-foreground">/year</span>
                </div>
              </div>
              <span className="rounded-full bg-[var(--cyan)]/10 px-3 py-1 text-xs font-semibold text-[var(--cyan)]">
                First {stats.total} only
              </span>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                'Verified Provider badge',
                'Enhanced visibility in your categories',
                'Full profile build-out (we write it)',
                'Founding status considered in relevant matches',
                'Founding-member badge while active',
                'One-time payment for the annual term — renewal handled separately',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan)]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <FoundingCheckoutButton soldOut={soldOut} />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Questions? Email{' '}
              <a
                href="mailto:jwilson@viso.group"
                className="text-[var(--cyan)] hover:underline"
              >
                jwilson@viso.group
              </a>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer note */}
      <section className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          Already listed?{' '}
          <Link href="/list-your-company" className="text-[var(--cyan)] hover:underline">
            Submit your company
          </Link>{' '}
          first, then claim your founding spot.
        </p>
      </section>
    </main>
  );
}
