import type { Metadata } from 'next';
import { Shield, Target, Users, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About CyberBench',
  description:
    'CyberBench is the trusted directory for finding and comparing cybersecurity service providers. A VISO Group product.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">
          About <span className="text-[var(--cyan)]">CyberBench</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Making cybersecurity procurement simpler, more transparent, and more accessible.
        </p>
      </div>

      <div className="mt-12 space-y-8 text-muted-foreground leading-relaxed">
        <p>
          Finding the right cybersecurity partner shouldn&apos;t be a guessing game. Yet for most
          mid-market businesses, selecting a security provider means cold-Googling, asking for
          referrals, or trusting whoever shows up first in a paid ad.
        </p>
        <p>
          <strong className="text-foreground">CyberBench changes that.</strong> We&apos;re building
          the most comprehensive, searchable directory of cybersecurity service providers — from
          managed security companies (MSSPs) to penetration testers, compliance auditors to virtual
          CISOs.
        </p>
        <p>
          Every listing is curated and verified. Providers can claim their listings to showcase
          certifications, specialties, and client success stories. Buyers can search by service type,
          location, industry focus, and more.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {[
          {
            icon: Target,
            title: 'Our Mission',
            text: 'Help every organization find cybersecurity experts they can trust, regardless of budget or technical knowledge.',
          },
          {
            icon: Shield,
            title: 'Built by Security Pros',
            text: 'CyberBench is a VISO Group product, built by people who understand both sides of the cybersecurity marketplace.',
          },
          {
            icon: Zap,
            title: 'ThreatScope Integration',
            text: 'Run a free security scan to understand your risk, then find the right provider to help — all in one place.',
          },
          {
            icon: Users,
            title: 'Community First',
            text: 'We believe in transparency. Provider reviews, ratings, and verified certifications are coming soon.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-6">
            <item.icon className="h-8 w-8 text-[var(--cyan)]" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
