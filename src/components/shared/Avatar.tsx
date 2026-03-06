import { memo } from 'react';

const PALETTES: [string, string][] = [
  ['#2d7a4f', '#1a5c38'],
  ['#7a5c2d', '#5c4520'],
  ['#4a6b3e', '#354d2d'],
  ['#6b4a3e', '#4d352d'],
  ['#3e5a6b', '#2d424d'],
  ['#6b3e5a', '#4d2d42'],
  ['#5a6b3e', '#424d2d'],
  ['#3e6b5a', '#2d4d42'],
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const sizes = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
  xl: 'h-16 w-16 text-lg',
};

interface AvatarProps {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}

export default memo(function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const hash = hashName(name);
  const [c1, c2] = PALETTES[hash % PALETTES.length];

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full font-display font-semibold tracking-wide text-ivory/90 ${className}`}
      style={{
        background: `linear-gradient(145deg, ${c1}, ${c2})`,
        boxShadow: `0 2px 8px ${c1}33`,
      }}
    >
      {getInitials(name)}
    </div>
  );
});
