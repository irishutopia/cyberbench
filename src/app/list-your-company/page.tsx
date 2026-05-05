import { Metadata } from 'next';
import { Building2 } from 'lucide-react';
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

      <SubmissionForm />
    </main>
  );
}
