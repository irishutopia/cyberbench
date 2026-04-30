import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProviderBySlug, getAllProviderSlugs } from '@/lib/data';
import { SITE_NAME } from '@/lib/constants';
import ClaimForm from '@/components/forms/ClaimForm';
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
    title: `Claim ${provider.name} on ${SITE_NAME}`,
    description: `Are you from ${provider.name}? Claim your free listing on ${SITE_NAME} to manage your profile, respond to leads, and connect with potential clients.`,
  };
}

export default async function ClaimProviderPage({ params }: PageProps) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Providers', url: '/providers' },
    { name: provider.name, url: `/providers/${slug}` },
    { name: 'Claim', url: `/claim/${slug}` },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--navy)] border border-border text-2xl font-bold text-[var(--cyan)]">
            {provider.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Claim <span className="text-[var(--cyan)]">{provider.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Verify your affiliation to manage this listing
            </p>
          </div>
        </div>
      </div>

      <ClaimForm providerSlug={slug} providerName={provider.name} />
    </div>
  );
}
