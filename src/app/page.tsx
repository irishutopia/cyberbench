import Link from 'next/link';
import { Shield, Search, Award, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import SearchBar from '@/components/layout/SearchBar';
import JsonLd from '@/components/seo/JsonLd';
import { getCategories, getStats } from '@/lib/data';

export default async function HomePage() {
  const [categories, stats] = await Promise.all([getCategories(), getStats()]);
  const featuredCategories = categories.slice(0, 6);

  return (
    <>
      <JsonLd type="website" />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy)] via-[var(--navy-light)] to-[var(--navy)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--cyan)]/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/10 px-4 py-1.5 text-sm text-[var(--cyan)]">
              <Shield className="h-4 w-4" />
              The Trusted Cybersecurity Directory
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find the Right{' '}
              <span className="text-[var(--cyan)]">Cybersecurity</span>{' '}
              Partner
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Browse {stats.providerCount}+ vetted cybersecurity service providers.
              Compare capabilities, read reviews, and connect with experts who protect businesses like yours.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 max-w-xl">
              <SearchBar size="lg" placeholder="Search providers, services, or locations..." />
            </div>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              {['Penetration Testing', 'MSSP', 'vCISO', 'Compliance'].map((term) => (
                <Link
                  key={term}
                  href={`/providers?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-border px-3 py-1 text-muted-foreground transition-colors hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-[var(--navy-light)]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { value: `${stats.providerCount}+`, label: 'Providers', icon: Shield },
            { value: `${stats.categoryCount}`, label: 'Service Categories', icon: Award },
            { value: `${stats.cityCount}+`, label: 'US Cities', icon: Search },
            { value: `${stats.stateCount}`, label: 'States Covered', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-[var(--cyan)]" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Browse by Service</h2>
          <p className="mt-2 text-muted-foreground">
            Find specialists in the exact cybersecurity service you need
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services/${cat.slug}`}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-[var(--cyan)]/50 hover:shadow-lg hover:shadow-[var(--cyan)]/5"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-[var(--cyan)] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cyan)] hover:text-[var(--cyan-light)]"
          >
            View all {stats.categoryCount} service categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="border-t border-border bg-[var(--navy-light)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Why CyberBench?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Making cybersecurity procurement simpler and more transparent
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: 'Compare Providers',
                description:
                  'Side-by-side comparison of services, certifications, and specialties. No more Googling in the dark.',
              },
              {
                icon: CheckCircle,
                title: 'Verified Listings',
                description:
                  'Every provider is vetted. Claimed listings are verified by our team. Know who you\'re working with.',
              },
              {
                icon: Shield,
                title: 'Free Security Scan',
                description:
                  'Run a free ThreatScope scan to understand your risk profile, then find the right expert to help.',
              },
            ].map((prop) => (
              <div key={prop.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--cyan)]/10">
                  <prop.icon className="h-6 w-6 text-[var(--cyan)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {prop.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--cyan)]/30 bg-gradient-to-r from-[var(--cyan)]/10 to-transparent p-8 sm:p-12">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Are you a cybersecurity provider?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Claim your free listing and start connecting with businesses that need your expertise.
              </p>
            </div>
            <Link
              href="/claim"
              className="shrink-0 rounded-lg bg-[var(--cyan)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
            >
              Claim Your Listing →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
