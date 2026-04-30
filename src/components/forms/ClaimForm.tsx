'use client';

import { useState } from 'react';
import { CheckCircle, User, Briefcase, Mail, Phone } from 'lucide-react';

interface ClaimFormProps {
  providerSlug: string;
  providerName: string;
}

export default function ClaimForm({ providerSlug, providerName }: ClaimFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const data = {
      providerSlug,
      fullName: form.get('fullName') as string,
      jobTitle: form.get('jobTitle') as string,
      workEmail: form.get('workEmail') as string,
      phone: form.get('phone') as string,
      verificationMethod: form.get('verificationMethod') as string,
      notes: form.get('notes') as string,
    };

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to submit claim');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">Claim Request Submitted!</h2>
        <p className="mt-2 text-muted-foreground">
          We&apos;ll review your claim for <strong>{providerName}</strong> and get back to you
          within 1-2 business days. Check your email for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Your Information</h2>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="John Smith"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-1.5">
            Job Title *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              required
              placeholder="VP of Marketing"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="workEmail" className="block text-sm font-medium text-foreground mb-1.5">
            Work Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="workEmail"
              name="workEmail"
              type="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Must match your company&apos;s domain for verification
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            Phone (optional)
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

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Verification</h2>

        <div>
          <label htmlFor="verificationMethod" className="block text-sm font-medium text-foreground mb-1.5">
            How should we verify your affiliation? *
          </label>
          <select
            id="verificationMethod"
            name="verificationMethod"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          >
            <option value="">Select a method...</option>
            <option value="email_domain">Email domain verification</option>
            <option value="linkedin">LinkedIn profile</option>
            <option value="company_website">Listed on company website</option>
            <option value="other">Other (describe below)</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Any additional info to help verify your claim..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--cyan)] px-6 py-3 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)] disabled:opacity-50"
      >
        {loading ? 'Submitting...' : `Submit Claim for ${providerName}`}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        By submitting, you confirm your affiliation with {providerName}. 
        We review all claims within 1-2 business days.
      </p>
    </form>
  );
}
