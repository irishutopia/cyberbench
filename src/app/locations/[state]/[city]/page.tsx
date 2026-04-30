import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProviderGrid from '@/components/providers/ProviderGrid';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  getCityBySlug,
  getProvidersInCity,
  getCategories,
  getStatesList,
  getCitiesByState,
} from '@/lib/data';
import { SITE_NAME, US_STATES, stateToSlug, cityToSlug } from '@/lib/constants';

interface PageProps {
  params: Promise<{ state: string; city: string }>;
}

export async function generateStaticParams() {
  const states = await getStatesList();
  const params: { state: string; city: string }[] = [];
  for (const state of states) {
    const cities = await getCitiesByState(state.code);
    for (const city of cities) {
      params.push({ state: state.slug, city: city.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const cityInfo = await getCityBySlug(stateSlug, citySlug);
  if (!cityInfo) return { title: 'City Not Found' };

  const title = `Cybersecurity Companies in ${cityInfo.name}, ${cityInfo.stateCode} (2026) | ${SITE_NAME}`;
  const description = `Find the best cybersecurity service providers in ${cityInfo.name}, ${cityInfo.state}. Compare penetration testing, managed security, compliance, and more from local experts.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { state: stateSlug, city: citySlug } = await params;
  const cityInfo = await getCityBySlug(stateSlug, citySlug);
  if (!cityInfo) notFound();

  // Resolve state code
  const stateEntry = Object.entries(US_STATES).find(
    ([, name]) => stateToSlug(name) === stateSlug
  );
  if (!stateEntry) notFound();
  const [stateCode] = stateEntry;

  const [providers, categories] = await Promise.all([
    getProvidersInCity(stateCode, cityInfo.name),
    getCategories(),
  ]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: cityInfo.state, url: `/locations/${stateSlug}` },
    { name: cityInfo.name, url: `/locations/${stateSlug}/${citySlug}` },
  ];

  // Services offered in this city
  const serviceSet = new Set<string>();
  for (const p of providers) {
    for (const s of p.services || []) {
      serviceSet.add(s.slug);
    }
  }
  const availableServices = categories.filter((c) => serviceSet.has(c.slug));

  // All services for SEO links (even without providers)
  const allServices = categories.slice(0, 12);

  return (
    <>
      <JsonLd type="breadcrumb" breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[var(--cyan)] mb-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">
              {cityInfo.name}, {cityInfo.stateCode}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Cybersecurity Companies in{' '}
            <span className="text-[var(--cyan)]">{cityInfo.name}</span>,{' '}
            {cityInfo.state}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {providers.length > 0
              ? `Compare ${providers.length} cybersecurity service providers in ${cityInfo.name}. Find experts in penetration testing, managed security, compliance, and more.`
              : `Discover cybersecurity service providers serving the ${cityInfo.name} area. Browse by service type to find the right partner.`}
          </p>
        </div>

        {/* Browse by service */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            <Shield className="inline h-5 w-5 mr-2 text-[var(--cyan)]" />
            Browse by Service in {cityInfo.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {(availableServices.length > 0 ? availableServices : allServices).map((svc) => (
              <Link
                key={svc.slug}
                href={`/locations/${stateSlug}/${citySlug}/${svc.slug}`}
              >
                <Badge
                  variant="secondary"
                  className="bg-[var(--cyan)]/10 text-[var(--cyan)] hover:bg-[var(--cyan)]/20 px-3 py-1.5 text-sm cursor-pointer"
                >
                  {svc.icon} {svc.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* Providers */}
        {providers.length > 0 ? (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Top Providers in {cityInfo.name}
            </h2>
            <ProviderGrid providers={providers} />
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-card p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              No providers listed in {cityInfo.name} yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              Know a cybersecurity company in {cityInfo.name}?{' '}
              <Link href="/claim" className="text-[var(--cyan)] hover:underline">
                Submit a listing
              </Link>{' '}
              or browse{' '}
              <Link
                href={`/locations/${stateSlug}`}
                className="text-[var(--cyan)] hover:underline"
              >
                other cities in {cityInfo.state}
              </Link>
              .
            </p>
            <Link
              href="/providers"
              className="mt-6 inline-block rounded-lg bg-[var(--cyan)] px-6 py-2.5 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
            >
              Browse All Providers
            </Link>
          </section>
        )}

        {/* FAQ Section for SEO */}
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `How do I find the best cybersecurity company in ${cityInfo.name}?`,
                a: `Browse our directory of cybersecurity providers in ${cityInfo.name}, ${cityInfo.state}. Compare services, read company profiles, and request quotes from multiple providers to find the best fit for your business needs and budget.`,
              },
              {
                q: `What cybersecurity services are available in ${cityInfo.name}?`,
                a: `Cybersecurity companies in ${cityInfo.name} offer services including penetration testing, managed security (MSSP), compliance assessments, incident response, virtual CISO, and more. Use the service filters above to find specialists in your area of need.`,
              },
              {
                q: `How much do cybersecurity services cost in ${cityInfo.name}?`,
                a: `Costs vary by service type and scope. Penetration testing typically ranges from $5,000–$50,000, managed security from $2,000–$20,000/month, and compliance assessments from $10,000–$75,000. Contact providers directly for custom quotes.`,
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-lg border border-border bg-card p-5"
              >
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
