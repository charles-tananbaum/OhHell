import { motion } from 'framer-motion';
import { Zap, AlertTriangle, Lightbulb } from 'lucide-react';
import type { PlayerAnalysis as AnalysisType, PlayerAnalysisItem } from '../../types';

interface PlayerAnalysisProps {
  analysis: AnalysisType | null;
}

const columns = [
  {
    key: 'pros' as const,
    label: 'Strengths',
    icon: Zap,
    color: 'text-green',
    accent: 'border-green/15',
  },
  {
    key: 'cons' as const,
    label: 'Weaknesses',
    icon: AlertTriangle,
    color: 'text-red',
    accent: 'border-red/15',
  },
  {
    key: 'advice' as const,
    label: 'Advice',
    icon: Lightbulb,
    color: 'text-amber',
    accent: 'border-amber/15',
  },
] as const;

export default function PlayerAnalysis({ analysis }: PlayerAnalysisProps) {
  if (!analysis) {
    return (
      <div className="rounded-xl border border-dashed border-separator-strong py-8 text-center text-sm text-text-secondary">
        Not enough data yet — play some games first!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {columns.map((col) => (
        <div key={col.key} className="rounded-xl card-surface overflow-hidden">
          <div className={`flex items-center gap-1.5 border-b ${col.accent} px-4 py-2.5`}>
            <col.icon size={13} className={col.color} />
            <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
              {col.label}
            </span>
          </div>
          <div className="divide-y divide-separator">
            {analysis[col.key].map((item: PlayerAnalysisItem, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-4 py-3"
              >
                <p className="text-xs font-bold text-ivory">{item.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
