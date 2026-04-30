import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProviderGrid from '@/components/providers/ProviderGrid';
import JsonLd from '@/components/seo/JsonLd';
import {
  getCategoryBySlug,
  getProvidersByCategory,
  getCategories,
} from '@/lib/data';
import { SITE_NAME } from '@/lib/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title:
      category.meta_title ||
      `Top ${category.name} Companies (2026)`,
    description:
      category.meta_description ||
      `Compare the best ${category.name.toLowerCase()} providers. Find trusted cybersecurity companies on ${SITE_NAME}.`,
  };
}

export default async function ServiceCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const providers = await getProvidersByCategory(slug);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: category.name, url: `/services/${category.slug}` },
  ];

  return (
    <>
      <JsonLd type="breadcrumb" breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-[var(--cyan)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-[var(--cyan)]">
            Services
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {category.name}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {providers.length} provider{providers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {category.description && (
            <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Provider Grid */}
        <ProviderGrid providers={providers} />

        {/* Back link */}
        <div className="mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--cyan)]"
          >
            <ArrowLeft className="h-4 w-4" />
            All service categories
          </Link>
        </div>
      </div>
    </>
  );
}
