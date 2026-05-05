'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Building2,
  Globe,
  FileText,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react';

interface Category {
  slug: string;
  name: string;
  icon: string | null;
}

const EMPLOYEE_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500-1000',
  '1000+',
];

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Government',
  'Retail',
  'Manufacturing',
  'Energy',
  'Education',
  'Legal',
];

const US_STATES: Record<string, string> = {
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

export default function SubmissionForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [existingProvider, setExistingProvider] = useState<{ slug: string; name: string } | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  function toggleService(slug: string) {
    setSelectedServices((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 5
          ? [...prev, slug]
          : prev
    );
  }

  function toggleIndustry(name: string) {
    setSelectedIndustries((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExistingProvider(null);

    const form = new FormData(e.currentTarget);
    const data = {
      companyName: form.get('companyName') as string,
      website: form.get('website') as string,
      description: form.get('description') as string,
      services: selectedServices,
      city: form.get('city') as string,
      stateCode: form.get('stateCode') as string,
      contactName: form.get('contactName') as string,
      contactEmail: form.get('contactEmail') as string,
      employeeCount: form.get('employeeCount') as string || undefined,
      foundedYear: form.get('foundedYear') as string || undefined,
      phone: form.get('phone') as string || undefined,
      longDescription: form.get('longDescription') as string || undefined,
      industriesServed: selectedIndustries.length ? selectedIndustries : undefined,
      _hp: form.get('_hp') as string,
    };

    if (selectedServices.length === 0) {
      setError('Please select at least one service category.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/providers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to submit. Please try again.');
        if (json.existingProvider) {
          setExistingProvider(json.existingProvider);
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">Submission Received!</h2>
        <p className="mt-2 text-muted-foreground">
          Thanks for submitting your company to CyberBench. We review all listings within
          1–2 business days and will notify you by email once your listing is live.
        </p>
        <Link
          href="/providers"
          className="mt-6 inline-block rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
        >
          Browse Directory
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Company Info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Company Information</h2>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1.5">
            Company Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="Acme Cybersecurity"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1.5">
            Website *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="website"
              name="website"
              type="url"
              required
              placeholder="https://www.example.com"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
            Short Description * <span className="text-xs text-muted-foreground">(10–500 chars)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              id="description"
              name="description"
              required
              minLength={10}
              maxLength={500}
              rows={3}
              placeholder="Briefly describe what your company does and your core cybersecurity services..."
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] resize-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="longDescription" className="block text-sm font-medium text-foreground mb-1.5">
            Detailed Description <span className="text-xs text-muted-foreground">(optional, up to 2000 chars)</span>
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            maxLength={2000}
            rows={4}
            placeholder="Tell potential clients more about your services, expertise, certifications, and what sets you apart..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] resize-none"
          />
        </div>
      </div>

      {/* Services */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Services Offered *</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Select up to 5 service categories ({selectedServices.length}/5 selected)
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggleService(cat.slug)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                selectedServices.includes(cat.slug)
                  ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 text-[var(--cyan)]'
                  : 'border-border text-muted-foreground hover:border-[var(--cyan)]/50 hover:text-foreground'
              } ${
                !selectedServices.includes(cat.slug) && selectedServices.length >= 5
                  ? 'opacity-40 cursor-not-allowed'
                  : ''
              }`}
              disabled={!selectedServices.includes(cat.slug) && selectedServices.length >= 5}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Location</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1.5">
              City *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="city"
                name="city"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="Austin"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stateCode" className="block text-sm font-medium text-foreground mb-1.5">
              State *
            </label>
            <select
              id="stateCode"
              name="stateCode"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            >
              <option value="">Select state...</option>
              {Object.entries(US_STATES)
                .sort(([, a], [, b]) => a.localeCompare(b))
                .map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Company Details (Optional) */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">
          Company Details <span className="text-sm font-normal text-muted-foreground">(optional)</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="foundedYear" className="block text-sm font-medium text-foreground mb-1.5">
              Founded Year
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="foundedYear"
                name="foundedYear"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                placeholder="2015"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="employeeCount" className="block text-sm font-medium text-foreground mb-1.5">
              Company Size
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                id="employeeCount"
                name="employeeCount"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
              >
                <option value="">Select size...</option>
                {EMPLOYEE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} employees
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Industries */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Industries Served
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => toggleIndustry(industry.toLowerCase())}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedIndustries.includes(industry.toLowerCase())
                    ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 text-[var(--cyan)]'
                    : 'border-border text-muted-foreground hover:border-[var(--cyan)]/50'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>

        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-foreground mb-1.5">
            Your Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="contactName"
              name="contactName"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="Jane Smith"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            We&apos;ll notify you when your listing is approved
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            Phone <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{error}</p>
          {existingProvider && (
            <Link
              href={`/providers/${existingProvider.slug}`}
              className="mt-2 inline-block text-sm font-medium text-[var(--cyan)] hover:underline"
            >
              View {existingProvider.name} →
            </Link>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--cyan)] px-6 py-3 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Your Company'
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        All submissions are reviewed within 1–2 business days. Free listings include
        your company name, description, services, and location. Need more visibility?{' '}
        <Link href="/about" className="text-[var(--cyan)] hover:underline">
          Learn about premium listings
        </Link>.
      </p>
    </form>
  );
}
