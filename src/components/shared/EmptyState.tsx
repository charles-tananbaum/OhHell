import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.04] ring-1 ring-white/[0.06]">
        <Icon size={28} className="text-text-secondary" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
