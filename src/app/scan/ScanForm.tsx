'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ScanForm() {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, email, name, company }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit scan request');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 py-8 text-center">
        <div className="rounded-full bg-green-500/10 p-3">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Scan Request Submitted!</h3>
        <p className="max-w-md text-muted-foreground">
          We&apos;re running your scan now. You&apos;ll receive your comprehensive security report
          at <strong className="text-foreground">{email}</strong> within 24 hours.
        </p>
        <button
          onClick={() => {
            setStatus('idle');
            setDomain('');
            setEmail('');
            setName('');
            setCompany('');
          }}
          className="mt-4 text-sm text-[var(--cyan)] hover:text-[var(--cyan-light)]"
        >
          Submit another scan →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-foreground">
            Domain to scan <span className="text-red-400">*</span>
          </label>
          <input
            id="domain"
            type="text"
            required
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-[var(--navy)] px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email for results <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-[var(--navy)] px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Your name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-[var(--navy)] px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-foreground">
            Company name
          </label>
          <input
            id="company"
            type="text"
            placeholder="Acme Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-[var(--navy)] px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--cyan)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)] disabled:opacity-50 sm:w-auto"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Run Free Scan'
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        By submitting, you agree to receive your scan results via email. We&apos;ll never share
        your information with third parties.
      </p>
    </form>
  );
}
