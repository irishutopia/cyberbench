'use client';

import { useState, FormEvent } from 'react';
import { Loader2, Shield, CheckCircle, AlertTriangle, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

const API_BASE = 'https://api.viso.group/api/v1';

const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  A: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Looking Good' },
  B: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'Minor Issues' },
  C: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Needs Attention' },
  D: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Significant Risk' },
  F: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Critical Exposure' },
};

const SCAN_MESSAGES = [
  'Resolving DNS records...',
  'Discovering subdomains via certificate transparency...',
  'Checking SSL/TLS configuration...',
  'Analyzing security headers...',
  'Scanning open ports...',
  'Checking email security (SPF, DMARC, DKIM)...',
  'Calculating risk score...',
];

interface ScanSummary {
  subdomains_found: number;
  open_services: number;
  issues_found: number;
  critical: number;
  high: number;
  medium: number;
}

interface ScanResult {
  domain: string;
  grade: string;
  score: number;
  summary: ScanSummary;
  preview_findings: string[];
  scan_id: string;
}

export default function InstantScanWidget() {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'results' | 'sent' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleScan(e: FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;

    setStatus('scanning');
    setErrorMsg('');

    let msgIdx = 0;
    setScanMessage(SCAN_MESSAGES[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % SCAN_MESSAGES.length;
      setScanMessage(SCAN_MESSAGES[msgIdx]);
    }, 3000);

    try {
      const res = await fetch(`${API_BASE}/free-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      clearInterval(interval);

      if (res.status === 429) {
        setStatus('error');
        setErrorMsg('Rate limit reached. Please try again later.');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Scan failed');
      }

      const data: ScanResult = await res.json();
      setResult(data);
      setStatus('results');

      // Also store referral in Supabase (best-effort, don't block)
      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: data.domain,
          email: '',
          name: 'Instant Scan',
          company: '',
        }),
      }).catch(() => {});
    } catch (err) {
      clearInterval(interval);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !result) return;

    try {
      const res = await fetch(`${API_BASE}/free-scan/${result.scan_id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setStatus('sent');

        // Update Supabase referral with email (best-effort)
        fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: result.domain,
            email: email.trim(),
            name: 'Instant Scan (report requested)',
            company: '',
          }),
        }).catch(() => {});
      } else {
        setErrorMsg('Failed to send report. Please try again.');
      }
    } catch {
      setErrorMsg('Failed to send report. Please try again.');
    }
  }

  function handleReset() {
    setDomain('');
    setStatus('idle');
    setResult(null);
    setEmail('');
    setErrorMsg('');
  }

  /* ── Idle: Domain input ── */
  if (status === 'idle' || status === 'error') {
    return (
      <div className="mt-6">
        <form onSubmit={handleScan} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            placeholder="Enter your domain (e.g., company.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-[var(--navy)] px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--cyan)] px-8 py-3 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
          >
            Scan Now <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        {status === 'error' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Instant results in ~30 seconds • No signup required • Powered by ThreatScope
        </p>
      </div>
    );
  }

  /* ── Scanning ── */
  if (status === 'scanning') {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-[var(--cyan)]/20" style={{ animationDuration: '2s' }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[var(--cyan)]/30 bg-[var(--cyan)]/10">
            <Shield className="h-8 w-8 animate-pulse text-[var(--cyan)]" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Scanning {domain}...
        </h3>
        <p className="animate-pulse text-sm text-[var(--cyan)]">{scanMessage}</p>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-[var(--navy)]">
          <div
            className="h-full rounded-full bg-[var(--cyan)]"
            style={{
              animation: 'scan-progress 25s ease-in-out forwards',
            }}
          />
        </div>
        <style jsx>{`
          @keyframes scan-progress {
            0% { width: 0%; }
            20% { width: 30%; }
            50% { width: 55%; }
            80% { width: 80%; }
            100% { width: 95%; }
          }
        `}</style>
      </div>
    );
  }

  /* ── Results ── */
  if ((status === 'results' || status === 'sent') && result) {
    const grade = GRADE_CONFIG[result.grade] || GRADE_CONFIG['C'];

    return (
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {/* Grade header */}
        <div className={`${grade.bg} border-b ${grade.border} p-6 text-center`}>
          <p className="text-sm text-muted-foreground">{result.domain}</p>
          <div className={`text-7xl font-black ${grade.color}`}>{result.grade}</div>
          <p className={`text-lg font-semibold ${grade.color}`}>{grade.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">Score: {result.score}/100</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{result.summary.subdomains_found}</div>
            <div className="text-xs text-muted-foreground">Subdomains</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{result.summary.open_services}</div>
            <div className="text-xs text-muted-foreground">Open Ports</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{result.summary.issues_found}</div>
            <div className="text-xs text-muted-foreground">Issues Found</div>
          </div>
        </div>

        {/* Severity badges */}
        {(result.summary.critical > 0 || result.summary.high > 0 || result.summary.medium > 0) && (
          <div className="flex gap-2 border-b border-border px-6 py-3">
            {result.summary.critical > 0 && (
              <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400">
                {result.summary.critical} Critical
              </span>
            )}
            {result.summary.high > 0 && (
              <span className="rounded-full bg-orange-500/20 px-2.5 py-1 text-xs font-semibold text-orange-400">
                {result.summary.high} High
              </span>
            )}
            {result.summary.medium > 0 && (
              <span className="rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs font-semibold text-yellow-400">
                {result.summary.medium} Medium
              </span>
            )}
          </div>
        )}

        {/* Findings */}
        <div className="border-b border-border px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Key Findings</h4>
          <ul className="space-y-2">
            {result.preview_findings.map((finding, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                {finding.startsWith('✓') ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                )}
                <span>{finding.startsWith('✓') ? finding.slice(2) : finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Email gate / sent / CTA */}
        <div className="bg-[var(--navy)] p-6">
          {status === 'sent' ? (
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2 font-semibold text-green-400">
                <CheckCircle className="h-5 w-5" /> Report Sent!
              </div>
              <p className="text-sm text-muted-foreground">Check your inbox for the full detailed report.</p>
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/providers"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--cyan)] px-5 py-2.5 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
                >
                  Find Security Experts <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-card"
                >
                  Scan Another
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm font-medium text-foreground">
                <Mail className="mr-1.5 inline-block h-4 w-4 text-[var(--cyan)]" />
                Get the full report with detailed findings and remediation steps:
              </p>
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-[var(--navy-light)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-lg bg-[var(--cyan)] px-5 py-2.5 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-light)]"
                >
                  Send Report
                </button>
              </form>
              {errorMsg && (
                <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Need help fixing these?{' '}
                  <Link href="/providers" className="text-[var(--cyan)] hover:underline">
                    Find an expert →
                  </Link>
                </span>
                <button onClick={handleReset} className="text-[var(--cyan)] hover:underline">
                  Scan another domain
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
