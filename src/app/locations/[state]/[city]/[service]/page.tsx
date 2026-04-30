import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Shield, ArrowRight } from 'lucide-react';
import ProviderGrid from '@/components/providers/ProviderGrid';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  getCityBySlug,
  getCategoryBySlug,
  getProvidersInCityByService,
  getProvidersInCity,
  getAllLocationServiceCombos,
} from '@/lib/data';
import { SITE_NAME, US_STATES, stateToSlug } from '@/lib/constants';

interface PageProps {
  params: Promise<{ state: string; city: string; service: string }>;
}

export async function generateStaticParams() {
  const combos = await getAllLocationServiceCombos();
  return combos.map((c) => ({
    state: c.stateSlug,
    city: c.citySlug,
    service: c.serviceSlug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug, service: serviceSlug } = await params;
  const cityInfo = await getCityBySlug(stateSlug, citySlug);
  const category = await getCategoryBySlug(serviceSlug);
  if (!cityInfo || !category) return { title: 'Not Found' };

  const title = `${category.name} in ${cityInfo.name}, ${cityInfo.stateCode} - Best Providers (2026) | ${SITE_NAME}`;
  const description = `Find top ${category.name.toLowerCase()} companies in ${cityInfo.name}, ${cityInfo.state}. Compare providers, read reviews, and get quotes from local cybersecurity experts.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function CityServicePage({ params }: PageProps) {
  const { state: stateSlug, city: citySlug, service: serviceSlug } = await params;
  const cityInfo = await getCityBySlug(stateSlug, citySlug);
  const category = await getCategoryBySlug(serviceSlug);
  if (!cityInfo || !category) notFound();

  const stateEntry = Object.entries(US_STATES).find(
    ([, name]) => stateToSlug(name) === stateSlug
  );
  if (!stateEntry) notFound();
  const [stateCode] = stateEntry;

  const [exactProviders, cityProviders] = await Promise.all([
    getProvidersInCityByService(stateCode, cityInfo.name, serviceSlug),
    getProvidersInCity(stateCode, cityInfo.name),
  ]);

  // Other providers in same city that don't do this exact service
  const otherProviders = cityProviders.filter(
    (p) => !exactProviders.some((ep) => ep.slug === p.slug)
  );

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: cityInfo.state, url: `/locations/${stateSlug}` },
    { name: cityInfo.name, url: `/locations/${stateSlug}/${citySlug}` },
    {
      name: category.name,
      url: `/locations/${stateSlug}/${citySlug}/${serviceSlug}`,
    },
  ];

  // JSON-LD FAQ
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Who provides ${category.name.toLowerCase()} in ${cityInfo.name}, ${cityInfo.stateCode}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: exactProviders.length > 0
            ? `Top ${category.name.toLowerCase()} providers in ${cityInfo.name} include ${exactProviders.slice(0, 3).map((p) => p.name).join(', ')}. Browse all providers on CyberBench for detailed profiles and quotes.`
            : `While no providers are currently listed with headquarters in ${cityInfo.name} for ${category.name.toLowerCase()}, many cybersecurity firms serve the ${cityInfo.name} area remotely. Browse CyberBench to find the right provider.`,
        },
      },
      {
        '@type': 'Question',
        name: `How much does ${category.name.toLowerCase()} cost in ${cityInfo.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${category.name} costs in ${cityInfo.name} vary based on scope and provider. Contact multiple providers through CyberBench to compare quotes and find the best value for your organization.`,
        },
      },
    ],
  };

  return (
    <>
      <JsonLd type="breadcrumb" breadcrumbs={breadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{category.icon}</span>
            <div className="flex items-center gap-1.5 text-sm text-[var(--cyan)]">
              <MapPin className="h-4 w-4" />
              {cityInfo.name}, {cityInfo.stateCode}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-[var(--cyan)]">{category.name}</span> in{' '}
            {cityInfo.name}, {cityInfo.state}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {exactProviders.length > 0
              ? `Compare ${exactProviders.length} ${category.name.toLowerCase()} provider${exactProviders.length > 1 ? 's' : ''} in ${cityInfo.name}. ${category.description}`
              : `Find ${category.name.toLowerCase()} providers serving the ${cityInfo.name}, ${cityInfo.state} area. ${category.description}`}
          </p>
        </div>

        {/* Service description */}
        <section className="mb-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            About {category.name}
          </h2>
          <p className="text-muted-foreground">{category.description}</p>
          <Link
            href={`/services/${serviceSlug}`}
            className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--cyan)] hover:underline"
          >
            Learn more about {category.name}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* Exact match providers */}
        {exactProviders.length > 0 ? (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              <Shield className="inline h-5 w-5 mr-2 text-[var(--cyan)]" />
              {category.name} Providers in {cityInfo.name}
            </h2>
            <ProviderGrid providers={exactProviders} />
          </section>
        ) : (
          <section className="mb-12 rounded-xl border border-border bg-card p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              No {category.name.toLowerCase()} providers listed in {cityInfo.name} yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              Many cybersecurity firms provide {category.name.toLowerCase()} services remotely.{' '}
              <Link
                href={`/services/${serviceSlug}`}
                className="text-[var(--cyan)] hover:underline"
              >
                Browse all {category.name.toLowerCase()} providers
              </Link>{' '}
              or{' '}
              <Link href="/claim" className="text-[var(--cyan)] hover:underline">
                submit your company
              </Link>
              .
            </p>
          </section>
        )}

        {/* Other providers in city */}
        {otherProviders.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Other Cybersecurity Providers in {cityInfo.name}
            </h2>
            <ProviderGrid providers={otherProviders.slice(0, 6)} />
            {otherProviders.length > 6 && (
              <div className="mt-4 text-center">
                <Link
                  href={`/locations/${stateSlug}/${citySlug}`}
                  className="text-[var(--cyan)] hover:underline"
                >
                  View all {cityProviders.length} providers in {cityInfo.name} →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `What is ${category.name.toLowerCase()}?`,
                a: category.description || `${category.name} is a specialized cybersecurity service that helps organizations protect their digital assets and infrastructure.`,
              },
              {
                q: `How do I choose a ${category.name.toLowerCase()} provider in ${cityInfo.name}?`,
                a: `When selecting a ${category.name.toLowerCase()} provider in ${cityInfo.name}, consider their certifications, years of experience, industry specialization, and client reviews. Request proposals from multiple providers on CyberBench to compare.`,
              },
              {
                q: `Do I need a local provider for ${category.name.toLowerCase()}?`,
                a: `While having a local provider in ${cityInfo.name} can be beneficial for on-site assessments and face-to-face meetings, many ${category.name.toLowerCase()} services can be delivered remotely. The most important factor is expertise and fit for your specific needs.`,
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-lg border border-border bg-card p-5">
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
