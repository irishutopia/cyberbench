import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name?: string;
  label?: string;
  url?: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto">
      <Link href="/" className="shrink-0 hover:text-[var(--cyan)] transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, i) => {
        const text = item.name || item.label || '';
        const link = item.url || item.href;
        return (
          <span key={link || text} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {i === items.length - 1 || !link ? (
              <span className="text-foreground font-medium">{text}</span>
            ) : (
              <Link href={link} className="hover:text-[var(--cyan)] transition-colors">
                {text}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
