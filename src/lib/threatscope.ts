// ThreatScope integration utilities

export interface ThreatScopeReferral {
  scanId: string;
  domain: string;
  riskScore: number;
  issues: string[];
  timestamp: string;
}

// Map ThreatScope issues → CyberBench service categories
export const ISSUE_TO_SERVICE: Record<string, string[]> = {
  ssl_expired: ['security-hardening', 'managed-security'],
  missing_headers: ['security-hardening', 'application-security'],
  open_ports: ['penetration-testing', 'network-security'],
  outdated_software: ['vulnerability-management'],
  no_dmarc: ['email-security'],
  dns_issues: ['network-security'],
  compliance_gaps: ['compliance-assessment', 'grc'],
  weak_ciphers: ['security-hardening', 'network-security'],
  exposed_services: ['penetration-testing', 'managed-security'],
  missing_security_txt: ['security-consulting'],
};

// Human-readable issue labels
export const ISSUE_LABELS: Record<string, string> = {
  ssl_expired: 'SSL/TLS Certificate Issues',
  missing_headers: 'Missing Security Headers',
  open_ports: 'Open Ports Detected',
  outdated_software: 'Outdated Software',
  no_dmarc: 'Missing DMARC/Email Security',
  dns_issues: 'DNS Configuration Issues',
  compliance_gaps: 'Compliance Gaps',
  weak_ciphers: 'Weak Cipher Suites',
  exposed_services: 'Exposed Services',
  missing_security_txt: 'Missing security.txt',
};

export function getRiskLevel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) return { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/10' };
  if (score >= 60) return { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
  if (score >= 40) return { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
  if (score >= 20) return { label: 'Low', color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
  return { label: 'Minimal', color: 'text-green-400', bgColor: 'bg-green-500/10' };
}

export function getRecommendedServices(issues: string[]): string[] {
  const services = issues
    .flatMap((issue) => ISSUE_TO_SERVICE[issue] || [])
    .filter((v, i, a) => a.indexOf(v) === i);
  return services;
}

export function generateReferralUrl(referral: ThreatScopeReferral): string {
  const services = getRecommendedServices(referral.issues);
  const params = new URLSearchParams({
    ref: 'threatscope',
    scan: referral.scanId,
    score: String(referral.riskScore),
    services: services.join(','),
  });
  return `https://cyberbench.net/scan?${params}`;
}
