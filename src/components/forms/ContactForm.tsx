'use client';

import { useState } from 'react';
import { CheckCircle, User, Mail, Building2, MessageSquare } from 'lucide-react';

interface ContactFormProps {
  providerSlug: string;
  providerName: string;
}

export default function ContactForm({ providerSlug, providerName }: ContactFormProps) {
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
      name: form.get('name') as string,
      email: form.get('email') as string,
      company: form.get('company') as string,
      phone: form.get('phone') as string,
      serviceNeeded: form.get('serviceNeeded') as string,
      message: form.get('message') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to submit');
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
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-green-400" />
        <h3 className="mt-3 font-semibold text-foreground">Message Sent!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your inquiry has been sent to {providerName}. They&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1">
          Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-company" className="block text-sm font-medium text-foreground mb-1">
          Company
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="contact-company"
            name="company"
            type="text"
            placeholder="Your company"
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-service" className="block text-sm font-medium text-foreground mb-1">
          Service Needed
        </label>
        <select
          id="contact-service"
          name="serviceNeeded"
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
        >
          <option value="">Select a service...</option>
          <option value="penetration-testing">Penetration Testing</option>
          <option value="managed-security">Managed Security (MSSP)</option>
          <option value="incident-response">Incident Response</option>
          <option value="compliance-assessment">Compliance & Audit</option>
          <option value="vciso">Virtual CISO</option>
          <option value="vulnerability-management">Vulnerability Management</option>
          <option value="cloud-security">Cloud Security</option>
          <option value="security-consulting">Security Consulting</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1">
          Message *
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            placeholder="Tell them about your needs..."
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--cyan)] px-4 py-2.5 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)] disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Get a Quote'}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Your info is shared only with {providerName}. We never spam.
      </p>
    </form>
  );
}
