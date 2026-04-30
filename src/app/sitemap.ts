import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { stateToSlug, cityToSlug } from '@/lib/constants';
import { SERVICE_CATEGORIES, PROVIDERS, CITIES } from '@/lib/seed-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/providers`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/claim`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Provider pages
  const providerPages: MetadataRoute.Sitemap = PROVIDERS.map((p) => ({
    url: `${SITE_URL}/providers/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Service category pages
  const servicePages: MetadataRoute.Sitemap = SERVICE_CATEGORIES.map((c) => ({
    url: `${SITE_URL}/services/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // State pages
  const stateSet = new Map<string, string>();
  for (const city of CITIES) {
    stateSet.set(city.state_code, city.state);
  }
  const statePages: MetadataRoute.Sitemap = Array.from(stateSet.entries()).map(
    ([, stateName]) => ({
      url: `${SITE_URL}/locations/${stateToSlug(stateName)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
  );

  // City pages
  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${SITE_URL}/locations/${stateToSlug(city.state)}/${cityToSlug(city.name)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // City + service combo pages
  const comboPages: MetadataRoute.Sitemap = [];
  for (const city of CITIES) {
    const stSlug = stateToSlug(city.state);
    const ctSlug = cityToSlug(city.name);
    for (const svc of SERVICE_CATEGORIES) {
      comboPages.push({
        url: `${SITE_URL}/locations/${stSlug}/${ctSlug}/${svc.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  return [
    ...staticPages,
    ...providerPages,
    ...servicePages,
    ...statePages,
    ...cityPages,
    ...comboPages,
  ];
}
