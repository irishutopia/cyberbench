import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, AlertTriangle, CheckCircle, ArrowRight, Zap, Globe, Lock, Mail, Server } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { ISSUE_LABELS, getRiskLevel, getRecommendedServices } from '@/lib/threatscope';
import { getCategories } from '@/lib/data';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import ScanForm from './ScanForm';

export const metadata: Metadata = {
  title: `Free Security Scan — ${SITE_NAME}`,
  description:
    'Run a free external attack surface scan powered by ThreatScope. Discover vulnerabilities, misconfigurations, and security gaps — then find experts to fix them.',
  openGraph: {
    title: `Free Security Scan — ${SITE_NAME}`,
    description:
      'Discover your external attack surface vulnerabilities with a free ThreatScope scan.',
  },
};

interface ScanPageProps {
  searchParams: Promise<{
    ref?: string;
    scan?: string;
    score?: string;
    services?: string;
    domain?: string;
  }>;
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  const params = await searchParams;
  const isReferral = params.ref === 'threatscope' && params.score;
  const riskScore = params.score ? parseInt(params.score, 10) : null;
  const recommendedServiceSlugs = params.services ? params.services.split(',') : [];
  const scannedDomain = params.domain || '';

  const categories = await getCategories();
  const recommendedCategories = categories.filter((c) =>
    recommendedServiceSlugs.includes(c.slug)
  );

  const risk = riskScore !== null ? getRiskLevel(riskScore) : null;

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Free Security Scan' }]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy)] via-[var(--navy-light)] to-[var(--navy)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--cyan)]/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/10 px-4 py-1.5 text-sm text-[var(--cyan)]">
              <Zap className="h-4 w-4" />
              Powered by ThreatScope
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Free External{' '}
              <span className="text-[var(--cyan)]">Security Scan</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Discover what attackers see when they look at your organization.
              Get a comprehensive external attack surface assessment — completely free.
            </p>
          </div>
        </div>
      </section>

      {/* Referral Results (if coming from ThreatScope) */}
      {isReferral && risk && (
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className={`rounded-xl border ${riskScore! >= 60 ? 'border-red-500/30' : 'border-yellow-500/30'} bg-card p-6 sm:p-8`}>
            <div className="flex items-start gap-4">
              <div className={`rounded-lg ${risk.bgColor} p-3`}>
                <AlertTriangle className={`h-6 w-6 ${risk.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  Your Scan Results
                  {scannedDomain && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      for {scannedDomain}
                    </span>
                  )}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`text-3xl font-bold ${risk.color}`}>{riskScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100 Risk Score</span>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${risk.bgColor} ${risk.color}`}>
                    {risk.label} Risk
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Based on your scan results, we recommend working with specialists in the following areas:
                </p>
              </div>
            </div>

            {recommendedCategories.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {recommendedCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/services/${cat.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-[var(--navy)] p-4 transition-colors hover:border-[var(--cyan)]/50"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground">Find providers →</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/providers"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--cyan)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
              >
                Browse All Providers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Scan Form */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground">
            {isReferral ? 'Run Another Scan' : 'Scan Your Domain'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enter your domain to receive a comprehensive external security assessment.
            Results will be emailed to you within 24 hours.
          </p>
          <ScanForm />
        </div>
      </section>

      {/* What We Check */}
      <section className="border-t border-border bg-[var(--navy-light)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              What We Scan For
            </h2>
            <p className="mt-2 text-muted-foreground">
              Our external attack surface assessment checks for common vulnerabilities and misconfigurations
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Lock, title: 'SSL/TLS Security', desc: 'Certificate validity, cipher strength, and protocol versions' },
              { icon: Globe, title: 'DNS Configuration', desc: 'DNSSEC, SPF, DKIM, DMARC records and configuration' },
              { icon: Server, title: 'Open Ports & Services', desc: 'Exposed services, unnecessary open ports, and banners' },
              { icon: Shield, title: 'Security Headers', desc: 'CSP, HSTS, X-Frame-Options, and other HTTP headers' },
              { icon: Mail, title: 'Email Security', desc: 'SPF, DKIM, DMARC policies and email authentication' },
              { icon: AlertTriangle, title: 'Known Vulnerabilities', desc: 'CVE checks on detected software and services' },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                <item.icon className="h-5 w-5 text-[var(--cyan)]" />
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Find Experts */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--cyan)]/30 bg-gradient-to-r from-[var(--cyan)]/10 to-transparent p-8 sm:p-12">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Need help fixing what we found?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Browse our directory of vetted cybersecurity providers who can help remediate vulnerabilities and strengthen your security posture.
              </p>
            </div>
            <Link
              href="/providers"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--cyan)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
            >
              Find an Expert
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
