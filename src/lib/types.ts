export interface Provider {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  long_description: string | null;
  website: string | null;
  logo_url: string | null;
  founded_year: number | null;
  headquarters: string | null;
  employee_count: string | null;
  city: string | null;
  state: string | null;
  state_code: string | null;
  country: string;
  status: 'draft' | 'active' | 'claimed' | 'suspended';
  tier: 'free' | 'professional' | 'premium' | 'enterprise';
  is_claimed: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  meta_title: string | null;
  meta_description: string | null;
  industries_served: string[] | null;
  company_sizes_served: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined
  services?: ServiceCategory[];
  certifications?: Certification[];
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  page_content: string | null;
  created_at: string;
  provider_count?: number;
}

export interface Certification {
  id: string;
  slug: string;
  name: string;
  issuing_body: string | null;
  description: string | null;
  icon: string | null;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  state: string;
  state_code: string;
  population: number | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

export interface ProviderFilters {
  q?: string;
  category?: string;
  state?: string;
  city?: string;
  page?: number;
}
