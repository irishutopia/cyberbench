import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getStatesList, getStats } from '@/lib/data';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Cybersecurity Companies by Location | ${SITE_NAME}`,
  description:
    'Find cybersecurity service providers near you. Browse by state and city to find local experts in penetration testing, managed security, compliance, and more.',
  openGraph: {
    title: `Cybersecurity Companies by Location | ${SITE_NAME}`,
    description: 'Find cybersecurity service providers near you. Browse by state and city.',
  },
};

export default async function LocationsPage() {
  const [states, stats] = await Promise.all([getStatesList(), getStats()]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
  ];

  return (
    <>
      <JsonLd type="breadcrumb" breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Cybersecurity Providers by <span className="text-[var(--cyan)]">Location</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Browse {stats.providerCount}+ cybersecurity companies across {states.length} states
            and {stats.cityCount} cities.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'States', value: states.length, icon: MapPin },
            { label: 'Cities', value: stats.cityCount, icon: Building2 },
            { label: 'Providers', value: stats.providerCount, icon: Building2 },
            { label: 'Services', value: stats.categoryCount, icon: Building2 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-4 text-center"
            >
              <p className="text-2xl font-bold text-[var(--cyan)]">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* State grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {states.map((state) => (
            <Link key={state.code} href={`/locations/${state.slug}`}>
              <Card className="group h-full border-border bg-card transition-all hover:border-[var(--cyan)]/50 hover:shadow-lg hover:shadow-[var(--cyan)]/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h2 className="font-semibold text-foreground group-hover:text-[var(--cyan)] transition-colors">
                      {state.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {state.cityCount} {state.cityCount === 1 ? 'city' : 'cities'}
                      {state.providerCount > 0 && ` · ${state.providerCount} providers`}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--cyan)] transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
