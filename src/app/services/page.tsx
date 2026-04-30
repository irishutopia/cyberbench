import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getProvidersByCategory } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Cybersecurity Service Categories',
  description:
    'Browse all cybersecurity service categories including penetration testing, managed security, compliance, and more.',
};

export default async function ServicesPage() {
  const categories = await getCategories();

  // Get provider counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const providers = await getProvidersByCategory(cat.slug);
      return { ...cat, provider_count: providers.length };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">
          Cybersecurity Service Categories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find specialists in every area of cybersecurity
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCounts.map((cat) => (
          <Link
            key={cat.id}
            href={`/services/${cat.slug}`}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-[var(--cyan)]/50 hover:shadow-lg hover:shadow-[var(--cyan)]/5"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{cat.icon}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground group-hover:text-[var(--cyan)] transition-colors">
                  {cat.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {cat.description}
                </p>
                <p className="mt-3 text-xs text-[var(--cyan)]">
                  {cat.provider_count} provider{cat.provider_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
