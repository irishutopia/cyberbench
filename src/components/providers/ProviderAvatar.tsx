import Image from 'next/image';

// Generate a consistent color from provider name
function nameToColor(name: string): string {
  const colors = [
    '#00b4d8', '#0077b6', '#48cae4', '#90e0ef',
    '#f472b6', '#a78bfa', '#34d399', '#fbbf24',
    '#f87171', '#60a5fa', '#818cf8', '#2dd4bf',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface ProviderAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10 text-lg',
  md: 'h-14 w-14 text-2xl',
  lg: 'h-20 w-20 text-3xl',
};

export default function ProviderAvatar({ name, logoUrl, size = 'md', className = '' }: ProviderAvatarProps) {
  const sizeClass = sizeClasses[size];
  const color = nameToColor(name);

  if (logoUrl) {
    const dimensions = size === 'sm' ? 40 : size === 'md' ? 56 : 80;
    return (
      <div className={`${sizeClass} shrink-0 overflow-hidden rounded-lg border border-border ${className}`}>
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={dimensions}
          height={dimensions}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} shrink-0 flex items-center justify-center rounded-lg border border-border font-bold ${className}`}
      style={{ backgroundColor: `${color}15`, color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
