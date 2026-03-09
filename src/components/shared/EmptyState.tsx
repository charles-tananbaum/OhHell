import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-separator-strong py-16 text-center"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-separator bg-surface-raised">
        <Icon size={24} className="text-text-muted" />
      </div>
      <h3 className="mb-1.5 font-display text-lg text-ivory">{title}</h3>
      <p className="mb-6 text-sm text-text-secondary">{description}</p>
      {action}
    </motion.div>
  );
}
