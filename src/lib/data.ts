import { createServerClient } from '@/lib/supabase/server';
import { SERVICE_CATEGORIES, PROVIDERS, CITIES } from '@/lib/seed-data';
import { ITEMS_PER_PAGE, US_STATES, stateToSlug, cityToSlug } from '@/lib/constants';
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

// ============================================================
// LOCATION DATA (for SEO pages)
// ============================================================

export interface StateInfo {
  code: string;
  name: string;
  slug: string;
  cityCount: number;
  providerCount: number;
}

export interface CityInfo {
  name: string;
  slug: string;
  state: string;
  stateCode: string;
  stateSlug: string;
  population: number | null;
  providerCount: number;
}

export async function getStatesList(): Promise<StateInfo[]> {
  const stateMap = new Map<string, { code: string; name: string; cities: Set<string>; providers: number }>();

  for (const city of CITIES) {
    if (!stateMap.has(city.state_code)) {
      stateMap.set(city.state_code, {
        code: city.state_code,
        name: city.state,
        cities: new Set(),
        providers: 0,
      });
    }
    stateMap.get(city.state_code)!.cities.add(city.name);
  }

  for (const p of PROVIDERS) {
    if (p.state_code && stateMap.has(p.state_code)) {
      stateMap.get(p.state_code)!.providers++;
    }
  }

  return Array.from(stateMap.values())
    .map((s) => ({
      code: s.code,
      name: s.name,
      slug: stateToSlug(s.name),
      cityCount: s.cities.size,
      providerCount: s.providers,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStateBySlug(stateSlug: string): Promise<StateInfo | null> {
  const states = await getStatesList();
  return states.find((s) => s.slug === stateSlug) || null;
}

export async function getCitiesByState(stateCode: string): Promise<CityInfo[]> {
  const stateName = US_STATES[stateCode] || '';
  const stateSlug = stateToSlug(stateName);

  return CITIES
    .filter((c) => c.state_code === stateCode)
    .map((c) => {
      const providerCount = PROVIDERS.filter(
        (p) => p.city?.toLowerCase() === c.name.toLowerCase() && p.state_code === stateCode
      ).length;
      return {
        name: c.name,
        slug: cityToSlug(c.name),
        state: c.state,
        stateCode: c.state_code,
        stateSlug,
        population: c.population,
        providerCount,
      };
    })
    .sort((a, b) => (b.population || 0) - (a.population || 0));
}

export async function getCityBySlug(
  stateSlug: string,
  citySlug: string
): Promise<CityInfo | null> {
  // Find state code from slug
  const stateEntry = Object.entries(US_STATES).find(
    ([, name]) => stateToSlug(name) === stateSlug
  );
  if (!stateEntry) return null;
  const [stateCode, stateName] = stateEntry;

  const city = CITIES.find(
    (c) => c.state_code === stateCode && cityToSlug(c.name) === citySlug
  );
  if (!city) return null;

  const providerCount = PROVIDERS.filter(
    (p) => p.city?.toLowerCase() === city.name.toLowerCase() && p.state_code === stateCode
  ).length;

  return {
    name: city.name,
    slug: cityToSlug(city.name),
    state: stateName,
    stateCode,
    stateSlug,
    population: city.population,
    providerCount,
  };
}

export async function getProvidersInCity(
  stateCode: string,
  cityName: string
): Promise<(Provider & { services?: ServiceCategory[] })[]> {
  return buildLocalProviders().filter(
    (p) =>
      p.city?.toLowerCase() === cityName.toLowerCase() &&
      p.state_code === stateCode
  );
}

export async function getProvidersInState(
  stateCode: string
): Promise<(Provider & { services?: ServiceCategory[] })[]> {
  return buildLocalProviders().filter((p) => p.state_code === stateCode);
}

export async function getProvidersInCityByService(
  stateCode: string,
  cityName: string,
  serviceSlug: string
): Promise<(Provider & { services?: ServiceCategory[] })[]> {
  return buildLocalProviders().filter(
    (p) =>
      p.city?.toLowerCase() === cityName.toLowerCase() &&
      p.state_code === stateCode &&
      p.services?.some((s) => s.slug === serviceSlug)
  );
}

// Get all city+service combos that have at least one provider
export async function getAllLocationServiceCombos(): Promise<
  { stateSlug: string; citySlug: string; serviceSlug: string }[]
> {
  const combos: { stateSlug: string; citySlug: string; serviceSlug: string }[] = [];
  const providers = buildLocalProviders();

  for (const city of CITIES) {
    const stSlug = stateToSlug(city.state);
    const ctSlug = cityToSlug(city.name);
    const cityProviders = providers.filter(
      (p) =>
        p.city?.toLowerCase() === city.name.toLowerCase() &&
        p.state_code === city.state_code
    );
    if (cityProviders.length === 0) continue;

    const serviceSet = new Set<string>();
    for (const p of cityProviders) {
      for (const s of p.services || []) {
        serviceSet.add(s.slug);
      }
    }
    for (const sSlug of serviceSet) {
      combos.push({ stateSlug: stSlug, citySlug: ctSlug, serviceSlug: sSlug });
    }
  }

  // Also generate combos for all cities × all services (for SEO, even without providers)
  for (const city of CITIES) {
    const stSlug = stateToSlug(city.state);
    const ctSlug = cityToSlug(city.name);
    for (const svc of SERVICE_CATEGORIES) {
      const key = `${stSlug}/${ctSlug}/${svc.slug}`;
      if (!combos.some((c) => `${c.stateSlug}/${c.citySlug}/${c.serviceSlug}` === key)) {
        combos.push({ stateSlug: stSlug, citySlug: ctSlug, serviceSlug: svc.slug });
      }
    }
  }

  return combos;
}
