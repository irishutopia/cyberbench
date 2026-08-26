import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { PROVIDERS } from '@/lib/seed-data';
import { getAllPosts } from '@/lib/blog';
import {
  getAllLocationServiceCombos,
  getCategories,
  getCitiesByState,
  getProvidersByCategory,
  getStatesList,
} from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/providers`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/claim`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/scan`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date || now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Provider pages
  const providerPages: MetadataRoute.Sitemap = PROVIDERS.map((p) => ({
    url: `${SITE_URL}/providers/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Service category pages
  const categories = await getCategories();
  const serviceInventory = await Promise.all(
    categories.map(async (category) => ({
      category,
      providers: await getProvidersByCategory(category.slug),
    }))
  );
  const servicePages: MetadataRoute.Sitemap = serviceInventory
    .filter(({ providers }) => providers.length > 0)
    .map(({ category }) => ({
      url: `${SITE_URL}/services/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Location pages are listed only when at least one matching provider exists.
  const states = await getStatesList();
  const populatedStates = states.filter((state) => state.providerCount > 0);
  const statePages: MetadataRoute.Sitemap = populatedStates.map((state) => ({
      url: `${SITE_URL}/locations/${state.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const citiesByState = await Promise.all(
    populatedStates.map(async (state) => ({
      state,
      cities: await getCitiesByState(state.code),
    }))
  );
  const cityPages: MetadataRoute.Sitemap = citiesByState.flatMap(({ state, cities }) =>
    cities
      .filter((city) => city.providerCount > 0)
      .map((city) => ({
        url: `${SITE_URL}/locations/${state.slug}/${city.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
  );

  const combos = await getAllLocationServiceCombos();
  const comboPages: MetadataRoute.Sitemap = combos.map((combo) => ({
    url: `${SITE_URL}/locations/${combo.stateSlug}/${combo.citySlug}/${combo.serviceSlug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...providerPages,
    ...servicePages,
    ...statePages,
    ...cityPages,
    ...comboPages,
  ];
}
