'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { Provider, ServiceCategory, Certification } from '@/lib/types';

interface ProfileEditorProps {
  provider: Provider;
  categories: ServiceCategory[];
  selectedServiceIds: string[];
  certifications: Certification[];
  selectedCertIds: string[];
}

export default function ProfileEditor({
  provider,
  categories,
  selectedServiceIds: initialServiceIds,
  certifications,
  selectedCertIds: initialCertIds,
}: ProfileEditorProps) {
  const [form, setForm] = useState({
    name: provider.name || '',
    description: provider.description || '',
    long_description: provider.long_description || '',
    website: provider.website || '',
    contact_email: provider.contact_email || '',
    contact_phone: provider.contact_phone || '',
    city: provider.city || '',
    state: provider.state || '',
    state_code: provider.state_code || '',
    employee_count: provider.employee_count || '',
    founded_year: provider.founded_year?.toString() || '',
  });
  const [selectedServices, setSelectedServices] = useState<string[]>(initialServiceIds);
  const [selectedCerts, setSelectedCerts] = useState<string[]>(initialCertIds);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleCert(id: string) {
    setSelectedCerts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/providers/${provider.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          founded_year: form.founded_year ? parseInt(form.founded_year) : null,
          service_ids: selectedServices,
          certification_ids: selectedCerts,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-border bg-[var(--navy)] px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]';
  const labelClass = 'block text-sm font-medium text-foreground';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Basic Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Company Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Short Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              maxLength={300}
              className={inputClass}
              placeholder="Brief description of your services (max 300 chars)"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Full Description</label>
            <textarea
              value={form.long_description}
              onChange={(e) => updateField('long_description', e.target.value)}
              rows={6}
              className={inputClass}
              placeholder="Detailed description of your company and services. Markdown supported."
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Contact Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Contact Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => updateField('contact_email', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Contact Phone</label>
            <input
              type="tel"
              value={form.contact_phone}
              onChange={(e) => updateField('contact_phone', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Location & Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>State Code</label>
            <input
              type="text"
              value={form.state_code}
              onChange={(e) => updateField('state_code', e.target.value)}
              maxLength={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Employee Count</label>
            <input
              type="text"
              value={form.employee_count}
              onChange={(e) => updateField('employee_count', e.target.value)}
              placeholder="e.g., 50-200"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Founded Year</label>
            <input
              type="number"
              value={form.founded_year}
              onChange={(e) => updateField('founded_year', e.target.value)}
              min={1900}
              max={2026}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Services */}
      {categories.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Services Offered</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select all services your company provides.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  selectedServices.includes(cat.id)
                    ? 'border-[var(--cyan)]/50 bg-[var(--cyan)]/10'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedServices.includes(cat.id)}
                  onChange={() => toggleService(cat.id)}
                  className="sr-only"
                />
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm text-foreground">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Certifications</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <button
                key={cert.id}
                type="button"
                onClick={() => toggleCert(cert.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  selectedCerts.includes(cert.id)
                    ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 text-[var(--cyan)]'
                    : 'border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                {cert.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--cyan)] px-6 py-2.5 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)] disabled:opacity-50"
        >
          {status === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
        {status === 'saved' && (
          <span className="flex items-center gap-1 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            Saved!
          </span>
        )}
      </div>
    </form>
  );
}
