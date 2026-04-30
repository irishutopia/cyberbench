import Link from 'next/link';
import { Shield, Zap } from 'lucide-react';

interface ScanCTAProps {
  variant?: 'banner' | 'inline' | 'card';
  className?: string;
}

export default function ScanCTA({ variant = 'inline', className = '' }: ScanCTAProps) {
  if (variant === 'banner') {
    return (
      <div className={`rounded-xl border border-[var(--cyan)]/30 bg-gradient-to-r from-[var(--cyan)]/10 via-[var(--cyan)]/5 to-transparent p-6 sm:p-8 ${className}`}>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[var(--cyan)]/20 p-2">
              <Shield className="h-6 w-6 text-[var(--cyan)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Not sure what you need?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Run a free security scan to discover your vulnerabilities and get matched with the right experts.
              </p>
            </div>
          </div>
          <Link
            href="/scan"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--cyan)] px-5 py-2.5 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
          >
            <Zap className="h-4 w-4" />
            Free Security Scan
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-xl border border-[var(--cyan)]/20 bg-card p-6 text-center ${className}`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cyan)]/10">
          <Shield className="h-6 w-6 text-[var(--cyan)]" />
        </div>
        <h3 className="mt-4 font-semibold text-foreground">Free Security Scan</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover vulnerabilities in your external attack surface with a free ThreatScope scan.
        </p>
        <Link
          href="/scan"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--cyan)] px-4 py-2 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
        >
          <Zap className="h-4 w-4" />
          Scan Now
        </Link>
      </div>
    );
  }

  // inline variant
  return (
    <Link
      href="/scan"
      className={`inline-flex items-center gap-2 rounded-lg border border-[var(--cyan)]/30 bg-[var(--cyan)]/10 px-4 py-2 text-sm font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)]/20 ${className}`}
    >
      <Zap className="h-4 w-4" />
      Free Security Scan
    </Link>
  );
}
