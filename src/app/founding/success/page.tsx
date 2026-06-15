import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Welcome, Founding Provider — ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function FoundingSuccessPage({ searchParams }: PageProps) {
  await searchParams; // session_id available if needed for client-side confirmation

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--cyan)]/10">
        <CheckCircle2 className="h-9 w-9 text-[var(--cyan)]" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">
        You&apos;re a Founding Provider 🎉
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
        Payment received. Your listing is being upgraded to verified founding
        status with locked-in top placement. Our team will reach out shortly to
        finish building out your profile.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/providers">
          <Button
            size="lg"
            className="h-11 bg-[var(--cyan)] px-6 text-[var(--navy)] hover:bg-[var(--cyan-light)]"
          >
            Browse the directory
          </Button>
        </Link>
        <Link href="/list-your-company">
          <Button size="lg" variant="outline" className="h-11 px-6">
            Update my listing
          </Button>
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Need anything? Email{' '}
        <a href="mailto:jwilson@viso.group" className="text-[var(--cyan)] hover:underline">
          jwilson@viso.group
        </a>
      </p>
    </main>
  );
}
