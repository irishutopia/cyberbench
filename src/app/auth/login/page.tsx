'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">Check Your Email</h1>
        <p className="mt-3 text-muted-foreground">
          We sent a magic link to <strong className="text-foreground">{email}</strong>.
          Click the link in your email to sign in.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Didn&apos;t receive it?{' '}
          <button
            onClick={() => setSent(false)}
            className="text-[var(--cyan)] hover:underline"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="text-center">
        <Shield className="mx-auto h-10 w-10 text-[var(--cyan)]" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Sign In to CyberBench</h1>
        <p className="mt-2 text-muted-foreground">
          Use your email to sign in with a magic link — no password needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--cyan)] px-4 py-2.5 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)] disabled:opacity-50"
        >
          {loading ? (
            'Sending...'
          ) : (
            <>
              Send Magic Link
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Are you a cybersecurity provider?{' '}
        <Link href="/claim" className="text-[var(--cyan)] hover:underline">
          Claim your listing
        </Link>
      </p>
    </div>
  );
}
