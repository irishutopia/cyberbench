import type { Metadata } from 'next';
import { Users, CheckCircle, Shield } from 'lucide-react';
import GetMatchedForm from './GetMatchedForm';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Get Matched — Find Your Cybersecurity Provider',
  description:
    'Tell us what you need and we\'ll match you with relevant cybersecurity providers using fit and profile-status signals.',
  alternates: { canonical: `${SITE_URL}/get-matched` },
};

export default function GetMatchedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/10 px-4 py-1.5 text-sm text-[var(--cyan)] mb-4">
          <Users className="h-4 w-4" />
          Free Matching Service
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Get Matched with the Right
          <span className="text-[var(--cyan)]"> Cybersecurity Provider</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Describe what you need and we&apos;ll connect you with up to 3 relevant providers
          who specialize in exactly that. No spam, no cold calls — just the right fit.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          {[
            { icon: CheckCircle, text: 'Up to 3 matched providers' },
            { icon: Shield, text: 'Verification status shown clearly' },
            { icon: Users, text: 'Introductions, not ads' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-1.5">
              <item.icon className="h-4 w-4 text-[var(--cyan)]" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <GetMatchedForm />
    </div>
  );
}
