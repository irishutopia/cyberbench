export const SITE_NAME = 'CyberBench';
export const SITE_URL = 'https://cyberbench.net';
export const SITE_DESCRIPTION = 'Find and compare the best cybersecurity service providers. The trusted directory for penetration testing, managed security, compliance, and more.';

export const NAV_LINKS = [
  { href: '/providers', label: 'Browse Providers' },
  { href: '/services', label: 'Services' },
  { href: '/locations', label: 'Locations' },
  { href: '/about', label: 'About' },
] as const;

export const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DC: 'District of Columbia', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

// Slugify a state name: "Texas" → "texas", "New York" → "new-york"
export function stateToSlug(stateName: string): string {
  return stateName.toLowerCase().replace(/\s+/g, '-');
}

// Slugify a city name: "San Francisco" → "san-francisco"
export function cityToSlug(cityName: string): string {
  return cityName.toLowerCase().replace(/[.]/g, '').replace(/\s+/g, '-');
}

export const ITEMS_PER_PAGE = 12;
