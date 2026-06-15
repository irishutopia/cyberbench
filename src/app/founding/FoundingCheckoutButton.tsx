'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  soldOut?: boolean;
  className?: string;
}

export default function FoundingCheckoutButton({ soldOut, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/founding/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || 'Could not start checkout. Please try again.');
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (soldOut) {
    return (
      <div className={className}>
        <Button size="lg" disabled className="h-12 w-full px-8 text-base sm:w-auto">
          All 25 founding spots claimed
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        size="lg"
        onClick={handleClick}
        disabled={loading}
        className="h-12 w-full bg-[var(--cyan)] px-8 text-base font-semibold text-[var(--navy)] hover:bg-[var(--cyan-light)] sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to checkout…
          </>
        ) : (
          <>
            Claim your founding spot — $499/yr
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
