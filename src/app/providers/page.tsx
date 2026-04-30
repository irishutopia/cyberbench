import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchBar from '@/components/layout/SearchBar';
import ProviderGrid from '@/components/providers/ProviderGrid';
import ProviderFilters from '@/components/providers/ProviderFilters';
import ScanCTA from '@/components/scan/ScanCTA';
import { getProviders, getCategories, getStates } from '@/lib/data';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Browse Cybersecurity Providers',
  description:
    'Search and compare cybersecurity service providers. Filter by service type, location, and specialization.',
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    state?: string;
    city?: string;
    page?: string;
  }>;
}

export default async function ProvidersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const filters = {
    q: params.q,
    category: params.category,
    state: params.state,
    city: params.city,
    page,
  };

  const [{ providers, total }, categories, states] = await Promise.all([
    getProviders(filters),
    getCategories(),
    getStates(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Build pagination href helper
  const buildPageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.category) sp.set('category', params.category);
    if (params.state) sp.set('state', params.state);
    if (params.city) sp.set('city', params.city);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return `/providers${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {params.q
            ? `Search results for "${params.q}"`
            : 'Browse Cybersecurity Providers'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {total} provider{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar defaultValue={params.q || ''} />
        <Suspense fallback={null}>
          <ProviderFilters categories={categories} states={states} />
        </Suspense>
      </div>

      {/* Scan CTA */}
      <div className="mb-6">
        <ScanCTA variant="banner" />
      </div>

      {/* Grid */}
      <ProviderGrid providers={providers} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={buildPageHref(page - 1)}
              className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageHref(page + 1)}
              className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
