import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Flame, ArrowRight } from 'lucide-react';
import SubmissionForm from './SubmissionForm';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `List Your Company — ${SITE_NAME}`,
  description: 'Submit your cybersecurity company to be listed on CyberBench, the trusted directory for finding security service providers.',
};

export default function ListYourCompanyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--cyan)]/10">
          <Building2 className="h-7 w-7 text-[var(--cyan)]" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">List Your Company</h1>
        <p className="mt-3 text-muted-foreground">
          Join the CyberBench directory and get discovered by organizations looking for
          cybersecurity service providers. Free to list — takes under 2 minutes.
        </p>
      </div>

      {/* Founding Provider upsell */}
      <Link
        href="/founding"
        className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-4 transition-colors hover:bg-[var(--cyan)]/10"
      >
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 shrink-0 text-[var(--cyan)]" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Want verified status &amp; top placement?
            </p>
            <p className="text-xs text-muted-foreground">
              Become a Founding Provider — first 25 firms only, $499/yr.
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--cyan)]" />
      </Link>

      <SubmissionForm />
    </main>
  );
}
