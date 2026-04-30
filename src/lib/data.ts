import { createServerClient } from '@/lib/supabase/server';
import { SERVICE_CATEGORIES, PROVIDERS, CITIES } from '@/lib/seed-data';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import type { Provider, ServiceCategory, City, ProviderFilters } from '@/lib/types';

// Check if Supabase is configured
const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(): Promise<ServiceCategory[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('sort_order');
      if (!error && data?.length) return data;
    } catch { /* fallback */ }
  }

  return SERVICE_CATEGORIES.map((cat, i) => ({
    id: `cat-${i}`,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    parent_id: null,
    sort_order: i,
    meta_title: null,
    meta_description: null,
    page_content: null,
    created_at: new Date().toISOString(),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}

// ============================================================
// PROVIDERS
// ============================================================

function buildLocalProviders(): (Provider & { services?: ServiceCategory[] })[] {
  const allCategories = SERVICE_CATEGORIES;

  return PROVIDERS.map((p, i) => ({
    id: `prov-${i}`,
    slug: p.slug,
    name: p.name,
    description: p.description,
    long_description: null,
    website: p.website,
    logo_url: null,
    founded_year: p.founded_year,
    headquarters: p.headquarters,
    employee_count: p.employee_count,
    city: p.city,
    state: p.state,
    state_code: p.state_code,
    country: 'US',
    status: 'active' as const,
    tier: 'free' as const,
    is_claimed: false,
    contact_email: null,
    contact_phone: null,
    meta_title: null,
    meta_description: null,
    industries_served: p.industries_served,
    company_sizes_served: ['all'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    services: p.services.map((sSlug) => {
      const cat = allCategories.find((c) => c.slug === sSlug);
      return cat
        ? {
            id: `cat-${allCategories.indexOf(cat)}`,
            slug: cat.slug,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            parent_id: null,
            sort_order: allCategories.indexOf(cat),
            meta_title: null,
            meta_description: null,
            page_content: null,
            created_at: new Date().toISOString(),
          }
        : null;
    }).filter(Boolean) as ServiceCategory[],
  }));
}

export async function getProviders(
  filters: ProviderFilters = {}
): Promise<{ providers: (Provider & { services?: ServiceCategory[] })[]; total: number }> {
  const { q, category, state, city, page = 1 } = filters;
  let providers = buildLocalProviders();

  // Apply filters
  if (q) {
    const query = q.toLowerCase();
    providers = providers.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.services?.some((s) => s.name.toLowerCase().includes(query))
    );
  }

  if (category) {
    providers = providers.filter((p) =>
      p.services?.some((s) => s.slug === category)
    );
  }

  if (state) {
    providers = providers.filter(
      (p) => p.state_code?.toLowerCase() === state.toLowerCase()
    );
  }

  if (city) {
    providers = providers.filter(
      (p) => p.city?.toLowerCase() === city.toLowerCase()
    );
  }

  const total = providers.length;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = providers.slice(start, start + ITEMS_PER_PAGE);

  return { providers: paginated, total };
}

export async function getProviderBySlug(
  slug: string
): Promise<(Provider & { services?: ServiceCategory[] }) | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from('providers')
        .select('*, provider_services(category_id, service_categories(*))')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();
      if (!error && data) {
        return {
          ...data,
          services: data.provider_services?.map(
            (ps: { service_categories: ServiceCategory }) => ps.service_categories
          ),
        };
      }
    } catch { /* fallback */ }
  }

  const providers = buildLocalProviders();
  return providers.find((p) => p.slug === slug) || null;
}

export async function getAllProviderSlugs(): Promise<string[]> {
  return PROVIDERS.map((p) => p.slug);
}

export async function getProvidersByCategory(
  categorySlug: string
): Promise<(Provider & { services?: ServiceCategory[] })[]> {
  const providers = buildLocalProviders();
  return providers.filter((p) =>
    p.services?.some((s) => s.slug === categorySlug)
  );
}

// ============================================================
// STATES (derived from providers)
// ============================================================

export async function getStates(): Promise<
  { state_code: string; state: string }[]
> {
  const stateSet = new Map<string, string>();
  PROVIDERS.forEach((p) => {
    if (p.state_code && p.state) {
      stateSet.set(p.state_code, p.state);
    }
  });
  return Array.from(stateSet.entries())
    .map(([state_code, state]) => ({ state_code, state }))
    .sort((a, b) => a.state.localeCompare(b.state));
}

// ============================================================
// CITIES
// ============================================================

export async function getCities(): Promise<City[]> {
  return CITIES.map((c, i) => ({
    id: `city-${i}`,
    slug: c.slug,
    name: c.name,
    state: c.state,
    state_code: c.state_code,
    population: c.population,
    meta_title: null,
    meta_description: null,
    created_at: new Date().toISOString(),
  }));
}

// ============================================================
// SEARCH
// ============================================================

export async function searchProviders(
  query: string
): Promise<(Provider & { services?: ServiceCategory[] })[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const providers = buildLocalProviders();
  return providers
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.services?.some((s) => s.name.toLowerCase().includes(q))
    )
    .slice(0, 20);
}

// ============================================================
// STATS (for homepage)
// ============================================================

export async function getStats() {
  return {
    providerCount: PROVIDERS.length,
    categoryCount: SERVICE_CATEGORIES.length,
    cityCount: CITIES.length,
    stateCount: new Set(PROVIDERS.map((p) => p.state_code)).size,
  };
}
