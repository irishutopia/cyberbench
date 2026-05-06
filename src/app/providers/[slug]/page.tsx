import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe,
  MapPin,
  Users,
  Calendar,
  Building2,
  ExternalLink,
  ArrowLeft,
  Mail,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import JsonLd from '@/components/seo/JsonLd';
import { getProviderBySlug, getAllProviderSlugs } from '@/lib/data';
import { SITE_NAME } from '@/lib/constants';
import ContactForm from '@/components/forms/ContactForm';
import ProviderAvatar from '@/components/providers/ProviderAvatar';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProviderSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) return { title: 'Provider Not Found' };

  return {
    title: provider.meta_title || `${provider.name} - Cybersecurity Services`,
    description:
      provider.meta_description ||
      provider.description ||
      `Learn about ${provider.name}'s cybersecurity services on ${SITE_NAME}.`,
  };
}

export default async function ProviderPage({ params }: PageProps) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Providers', url: '/providers' },
    { name: provider.name, url: `/providers/${provider.slug}` },
  ];

  return (
    <>
      <JsonLd type="organization" provider={provider} />
      <JsonLd type="breadcrumb" breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-start gap-6">
              <ProviderAvatar name={provider.name} logoUrl={provider.logo_url} size="lg" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {provider.name}
                </h1>
                {provider.headquarters && (
                  <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {provider.headquarters}
                  </p>
                )}
                {/* Tier badge */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {provider.is_claimed && (
                    <Badge className="bg-[var(--cyan)]/20 text-[var(--cyan)]">
                      ✓ Claimed
                    </Badge>
                  )}
                  {provider.is_claimed && provider.status === 'claimed' && (
                    <Badge className="bg-green-500/20 text-green-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Provider
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground">About</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {provider.description}
              </p>
              {provider.long_description && (
                <div className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {provider.long_description}
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Services */}
            {provider.services && provider.services.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Services
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {provider.services.map((svc) => (
                    <Link
                      key={svc.id}
                      href={`/services/${svc.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-[var(--cyan)]/50"
                    >
                      <span className="text-xl">{svc.icon}</span>
                      <span className="text-sm font-medium text-foreground">
                        {svc.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Industries */}
            {provider.industries_served &&
              provider.industries_served.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Industries Served
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {provider.industries_served.map((ind) => (
                        <Badge
                          key={ind}
                          variant="secondary"
                          className="capitalize"
                        >
                          {ind.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Company Info</h3>
              <div className="mt-4 space-y-3">
                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[var(--cyan)] hover:text-[var(--cyan-light)]"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {provider.headquarters && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {provider.headquarters}
                  </p>
                )}
                {provider.employee_count && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {provider.employee_count} employees
                  </p>
                )}
                {provider.founded_year && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Founded {provider.founded_year}
                  </p>
                )}
              </div>
            </div>

            {/* Get a Quote Form */}
            <div className="rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-6">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <MessageSquare className="h-5 w-5 text-[var(--cyan)]" />
                Get a Quote
              </h3>
              <p className="mt-2 mb-4 text-sm text-muted-foreground">
                Tell {provider.name} about your security needs.
              </p>
              <ContactForm providerSlug={provider.slug} providerName={provider.name} />
            </div>

            {/* Claim CTA */}
            {!provider.is_claimed && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">
                  Is this your company?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Claim this listing to update your information and connect with
                  potential clients.
                </p>
                <Link
                  href={`/claim/${provider.slug}`}
                  className="mt-4 block rounded-lg border border-[var(--cyan)] px-4 py-2 text-center text-sm font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)] hover:text-[var(--navy)]"
                >
                  Claim This Listing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link
            href="/providers"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--cyan)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all providers
          </Link>
        </div>
      </div>
    </>
  );
}
