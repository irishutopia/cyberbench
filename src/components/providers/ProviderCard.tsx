import Link from 'next/link';
import { MapPin, Globe, Users, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProviderAvatar from '@/components/providers/ProviderAvatar';
import type { Provider, ServiceCategory } from '@/lib/types';

interface ProviderCardProps {
  provider: Provider & { services?: ServiceCategory[] };
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/providers/${provider.slug}`}>
      <Card className="group h-full border-border bg-card transition-all hover:border-[var(--cyan)]/50 hover:shadow-lg hover:shadow-[var(--cyan)]/5">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <ProviderAvatar name={provider.name} logoUrl={provider.logo_url} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-[var(--cyan)] transition-colors">
                  {provider.name}
                </h3>
                {provider.is_claimed && provider.status === 'claimed' && (
                  <span className="flex items-center gap-0.5 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-400" title="Verified Provider">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              {provider.headquarters && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {provider.headquarters}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {provider.description && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {provider.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {provider.employee_count && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {provider.employee_count}
              </span>
            )}
            {provider.website && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                Website
              </span>
            )}
            {provider.founded_year && (
              <span>Est. {provider.founded_year}</span>
            )}
          </div>

          {/* Service tags */}
          {provider.services && provider.services.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {provider.services.slice(0, 3).map((svc) => (
                <Badge
                  key={svc.id}
                  variant="secondary"
                  className="bg-[var(--cyan)]/10 text-[var(--cyan)] hover:bg-[var(--cyan)]/20 text-xs"
                >
                  {svc.name}
                </Badge>
              ))}
              {provider.services.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{provider.services.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
