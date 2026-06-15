'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  CheckCircle,
  User,
  Mail,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

const TURNSTILE_SITE_KEY = '0x4AAAAAADJ3GAWqAcfqCsTD';

interface Category {
  slug: string;
  name: string;
  icon: string | null;
}

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

const BUDGET_OPTIONS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000 – $150,000',
  '$150,000+',
  'Not sure yet',
];

interface MatchResult {
  matchCount: number;
  providers: { name: string; slug: string }[];
}

export default function GetMatchedForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const renderTurnstile = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.turnstile &&
      turnstileRef.current &&
      !turnstileWidgetId.current
    ) {
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(null),
        'error-callback': () => setTurnstileToken(null),
        theme: 'dark',
      });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!turnstileToken) {
      setError('Please complete the security check.');
      setLoading(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      company: (form.get('company') as string) || null,
      categorySlug: form.get('categorySlug') as string,
      stateCode: form.get('stateCode') as string,
      budget: (form.get('budget') as string) || null,
      need: form.get('need') as string,
      _hp: form.get('_hp') as string,
      turnstileToken,
    };

    try {
      const res = await fetch('/api/get-matched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to submit. Please try again.');
        return;
      }

      setResult({ matchCount: json.matchCount, providers: json.providers });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current);
        setTurnstileToken(null);
      }
    }
  }

  if (result) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {result.matchCount > 0
            ? `We found ${result.matchCount} provider${result.matchCount !== 1 ? 's' : ''} for you`
            : 'Request received'}
        </h2>
        {result.matchCount > 0 ? (
          <>
            <p className="mt-2 text-muted-foreground">
              Check your inbox — we&apos;ve sent you their details and notified them about your project.
            </p>
            <ul className="mt-4 space-y-2 text-left">
              {result.providers.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/providers/${p.slug}`}
                    className="text-sm font-medium text-[var(--cyan)] hover:underline"
                  >
                    {p.name} →
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-muted-foreground">
            No providers matched your criteria right now. Our team will follow up shortly.
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/providers"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
          >
            Browse All Providers
          </Link>
          <button
            onClick={() => setResult(null)}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
        strategy="afterInteractive"
        onReady={() => renderTurnstile()}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onTurnstileLoad = function() { /* handled by onReady */ }`,
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Contact Info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Your Contact Information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Your Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
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
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1.5">
              Company <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="company"
                name="company"
                type="text"
                maxLength={100}
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
              />
            </div>
          </div>
        </div>

        {/* What you need */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">What You&apos;re Looking For</h2>

          <div>
            <label htmlFor="categorySlug" className="block text-sm font-medium text-foreground mb-1.5">
              Service Category *
            </label>
            <select
              id="categorySlug"
              name="categorySlug"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            >
              <option value="">Select a service...</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="stateCode" className="block text-sm font-medium text-foreground mb-1.5">
                Your State *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="stateCode"
                  name="stateCode"
                  required
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
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

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-1.5">
                Budget Range <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="budget"
                  name="budget"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
                >
                  <option value="">Select budget...</option>
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="need" className="block text-sm font-medium text-foreground mb-1.5">
              Describe What You Need *{' '}
              <span className="text-xs text-muted-foreground">(10–2000 chars)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="need"
                name="need"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                placeholder="Tell us what you're trying to solve. Include your industry, company size, any compliance requirements, and timeline if you have one..."
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] resize-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Turnstile */}
        <div className="flex flex-col items-center gap-2">
          <div ref={turnstileRef} />
          {turnstileToken && (
            <p className="flex items-center gap-1 text-xs text-green-400">
              <ShieldCheck className="h-3 w-3" />
              Security check passed
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="w-full rounded-lg bg-[var(--cyan)] px-6 py-3 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding your matches...
            </>
          ) : (
            'Find My Match'
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll match you with up to 3 vetted providers and notify them about your project.
          Your contact details are shared only with matched providers.
        </p>
      </form>
    </>
  );
}
