'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  size?: 'sm' | 'lg';
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Search cybersecurity providers...',
  size = 'sm',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/providers?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const sizeClasses =
    size === 'lg'
      ? 'h-14 text-lg px-6 pr-14'
      : 'h-10 text-sm px-4 pr-10';

  const iconClasses =
    size === 'lg' ? 'right-4 h-6 w-6' : 'right-3 h-4 w-4';

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-border bg-[var(--navy-light)] text-foreground placeholder:text-muted-foreground focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] ${sizeClasses}`}
      />
      <button
        type="submit"
        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[var(--cyan)] ${iconClasses}`}
        aria-label="Search"
      >
        <Search className="h-full w-full" />
      </button>
    </form>
  );
}
