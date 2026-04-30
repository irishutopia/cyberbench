import { SITE_URL, SITE_NAME } from '@/lib/constants';
import type { Provider } from '@/lib/types';

interface JsonLdProps {
  type: 'website' | 'organization' | 'breadcrumb';
  provider?: Provider;
  breadcrumbs?: { name: string; url: string }[];
}

export default function JsonLd({ type, provider, breadcrumbs }: JsonLdProps) {
  let data: Record<string, unknown> = {};

  if (type === 'website') {
    data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/providers?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  }

  if (type === 'organization' && provider) {
    data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: provider.name,
      url: provider.website || `${SITE_URL}/providers/${provider.slug}`,
      description: provider.description,
      ...(provider.logo_url && { logo: provider.logo_url }),
      ...(provider.founded_year && { foundingDate: String(provider.founded_year) }),
      ...(provider.headquarters && {
        address: {
          '@type': 'PostalAddress',
          addressLocality: provider.city,
          addressRegion: provider.state_code,
          addressCountry: provider.country,
        },
      }),
    };
  }

  if (type === 'breadcrumb' && breadcrumbs) {
    data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: `${SITE_URL}${item.url}`,
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
