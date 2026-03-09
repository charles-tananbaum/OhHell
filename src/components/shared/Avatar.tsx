import { memo } from 'react';

const PALETTES: [string, string][] = [
  ['#00d4aa', '#00a88a'],
  ['#6366f1', '#4f46e5'],
  ['#0ea5e9', '#0284c7'],
  ['#f43f5e', '#e11d48'],
  ['#8b5cf6', '#7c3aed'],
  ['#f0a030', '#d48a20'],
  ['#f97316', '#ea580c'],
  ['#ec4899', '#db2777'],
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
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide text-white/95 ${className}`}
      style={{
        background: `linear-gradient(145deg, ${c1}, ${c2})`,
        boxShadow: `0 2px 10px ${c1}25, inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      {getInitials(name)}
    </div>
  );
});
