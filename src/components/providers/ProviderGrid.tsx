import ProviderCard from './ProviderCard';
import type { Provider, ServiceCategory } from '@/lib/types';

interface ProviderGridProps {
  providers: (Provider & { services?: ServiceCategory[] })[];
}

export default function ProviderGrid({ providers }: ProviderGridProps) {
  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-lg font-medium text-foreground">No providers found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
