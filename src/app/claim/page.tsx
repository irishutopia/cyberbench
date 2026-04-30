import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, CheckCircle, BarChart3, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Claim Your Listing',
  description:
    'Cybersecurity providers: claim your free listing on CyberBench and connect with businesses that need your services.',
};

export default function ClaimPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-[var(--cyan)]" />
        <h1 className="mt-4 text-4xl font-bold text-foreground">
          Claim Your <span className="text-[var(--cyan)]">Free</span> Listing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Already listed on CyberBench? Take control of your profile and start connecting
          with potential clients.
        </p>
      </div>

      {/* Benefits */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            icon: CheckCircle,
            title: 'Verified Badge',
            text: 'Show clients you\'re a real, verified company with an official claimed listing.',
          },
          {
            icon: BarChart3,
            title: 'Profile Analytics',
            text: 'See how many people view your listing and what services they\'re searching for.',
          },
          {
            icon: Users,
            title: 'Lead Notifications',
            text: 'Get notified when potential clients express interest through your listing.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-6 text-center">
            <item.icon className="mx-auto h-8 w-8 text-[var(--cyan)]" />
            <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">
          Search for your company below, then follow the claim process.
        </p>
        <div className="mt-6">
          <Link
            href="/providers"
            className="inline-block rounded-lg bg-[var(--cyan)] px-6 py-3 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
          >
            Find Your Company →
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Don&apos;t see your company?{' '}
          <a href="mailto:jwilson@viso.group" className="text-[var(--cyan)] hover:underline">
            Contact us
          </a>{' '}
          to get listed.
        </p>
      </div>
    </div>
  );
}
