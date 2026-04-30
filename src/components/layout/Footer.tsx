import Link from 'next/link';
import { Shield } from 'lucide-react';

const footerLinks = {
  Directory: [
    { href: '/providers', label: 'Browse Providers' },
    { href: '/services', label: 'Service Categories' },
    { href: '/services/penetration-testing', label: 'Penetration Testing' },
    { href: '/services/managed-security', label: 'Managed Security' },
    { href: '/services/compliance-assessment', label: 'Compliance & Audit' },
  ],
  Company: [
    { href: '/about', label: 'About CyberBench' },
    { href: '/claim', label: 'Claim Your Listing' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  Resources: [
    { href: '/scan', label: 'Free Security Scan' },
    { href: '/blog/how-to-choose-mssp', label: 'How to Choose an MSSP' },
    { href: '/blog/cybersecurity-checklist', label: 'Security Checklist' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--navy)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Shield className="h-6 w-6 text-[var(--cyan)]" />
              <span>
                Cyber<span className="text-[var(--cyan)]">Bench</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The trusted directory for finding and comparing cybersecurity service providers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-[var(--cyan)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CyberBench. A VISO Group product. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
