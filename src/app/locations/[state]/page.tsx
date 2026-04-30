import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ProviderGrid from '@/components/providers/ProviderGrid';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  getStateBySlug,
  getStatesList,
  getCitiesByState,
  getProvidersInState,
  getCategories,
} from '@/lib/data';
import { SITE_NAME } from '@/lib/constants';

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  const states = await getStatesList();
  return states.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const stateInfo = await getStateBySlug(stateSlug);
  if (!stateInfo) return { title: 'State Not Found' };

  const title = `Cybersecurity Companies in ${stateInfo.name} (2026) | ${SITE_NAME}`;
  const description = `Find top cybersecurity service providers in ${stateInfo.name}. Browse ${stateInfo.cityCount} cities for penetration testing, managed security, compliance, and more.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const stateInfo = await getStateBySlug(stateSlug);
  if (!stateInfo) notFound();

  const [cities, providers, categories] = await Promise.all([
    getCitiesByState(stateInfo.code),
    getProvidersInState(stateInfo.code),
    getCategories(),
  ]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: stateInfo.name, url: `/locations/${stateSlug}` },
  ];

  // Top services in this state
  const serviceCount = new Map<string, number>();
  for (const p of providers) {
    for (const s of p.services || []) {
      serviceCount.set(s.slug, (serviceCount.get(s.slug) || 0) + 1);
    }
  }
  const topServices = categories
    .filter((c) => serviceCount.has(c.slug))
    .sort((a, b) => (serviceCount.get(b.slug) || 0) - (serviceCount.get(a.slug) || 0))
    .slice(0, 8);

  return (
    <>
      <JsonLd type="breadcrumb" breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[var(--cyan)] mb-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">{stateInfo.code}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Cybersecurity Companies in{' '}
            <span className="text-[var(--cyan)]">{stateInfo.name}</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Browse {providers.length} cybersecurity service providers across{' '}
            {cities.length} cities in {stateInfo.name}.
          </p>
        </div>

        {/* Cities grid */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Cities in {stateInfo.name}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/${stateSlug}/${city.slug}`}
              >
                <Card className="group h-full border-border bg-card transition-all hover:border-[var(--cyan)]/50 hover:shadow-lg hover:shadow-[var(--cyan)]/5">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-[var(--cyan)] transition-colors">
                        {city.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {city.providerCount > 0
                          ? `${city.providerCount} provider${city.providerCount > 1 ? 's' : ''}`
                          : 'View providers'}
                        {city.population && ` · Pop. ${(city.population / 1000).toFixed(0)}K`}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--cyan)] transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular services */}
        {topServices.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Popular Services in {stateInfo.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {topServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:border-[var(--cyan)]/50 hover:text-[var(--cyan)] transition-colors"
                >
                  {svc.icon} {svc.name}{' '}
                  <span className="text-xs">({serviceCount.get(svc.slug)})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Providers list */}
        {providers.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              All Providers in {stateInfo.name}
            </h2>
            <ProviderGrid providers={providers} />
          </section>
        )}
      </div>
    </>
  );
}
