'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Shield, Menu, X, Zap } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[var(--navy)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--navy)]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Shield className="h-7 w-7 text-[var(--cyan)]" />
          <span className="text-foreground">
            Cyber<span className="text-[var(--cyan)]">Bench</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--cyan)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/list-your-company"
            className="rounded-lg border border-[var(--cyan)]/30 px-3 py-1.5 text-sm font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)]/10"
          >
            List Your Company
          </Link>
          <Link
            href="/scan"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--cyan)] px-4 py-2 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
          >
            <Zap className="h-4 w-4" />
            Free Scan
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-[var(--navy)] px-4 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-sm font-medium text-muted-foreground hover:text-[var(--cyan)]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/scan"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--cyan)] px-4 py-2 text-sm font-semibold text-[var(--navy)]"
            onClick={() => setMobileOpen(false)}
          >
            <Zap className="h-4 w-4" />
            Free Security Scan
          </Link>
          <Link
            href="/list-your-company"
            className="mt-2 block rounded-lg border border-[var(--cyan)]/30 px-4 py-2 text-center text-sm font-medium text-[var(--cyan)]"
            onClick={() => setMobileOpen(false)}
          >
            List Your Company
          </Link>
        </nav>
      )}
    </header>
  );
}
