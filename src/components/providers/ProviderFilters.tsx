'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { ServiceCategory } from '@/lib/types';

interface ProviderFiltersProps {
  categories: ServiceCategory[];
  states: { state_code: string; state: string }[];
}

const US_STATES_MAP: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'Washington DC',
};

export default function ProviderFilters({ categories, states }: ProviderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentState = searchParams.get('state') || '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/providers?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
      {/* Category filter */}
      <select
        value={currentCategory}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="w-full rounded-lg border border-border bg-[var(--navy-light)] px-3 py-2.5 text-sm text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] sm:w-auto"
      >
        <option value="">All Services</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* State filter */}
      <select
        value={currentState}
        onChange={(e) => updateFilter('state', e.target.value)}
        className="w-full rounded-lg border border-border bg-[var(--navy-light)] px-3 py-2.5 text-sm text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] sm:w-auto"
      >
        <option value="">All States</option>
        {states.map((s) => (
          <option key={s.state_code} value={s.state_code}>
            {US_STATES_MAP[s.state_code] || s.state}
          </option>
        ))}
      </select>
    </div>
  );
}
