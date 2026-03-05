import { motion } from 'framer-motion';
import { Zap, AlertTriangle, Lightbulb } from 'lucide-react';
import type { PlayerAnalysis as AnalysisType, PlayerAnalysisItem } from '../../types';

interface PlayerAnalysisProps {
  analysis: AnalysisType | null;
}

const columns = [
  {
    key: 'pros' as const,
    label: 'Pros',
    icon: Zap,
    colors: { header: 'text-green', bg: 'bg-green/10', border: 'border-green/20' },
  },
  {
    key: 'cons' as const,
    label: 'Cons',
    icon: AlertTriangle,
    colors: { header: 'text-red', bg: 'bg-red/10', border: 'border-red/20' },
  },
  {
    key: 'advice' as const,
    label: 'Advice',
    icon: Lightbulb,
    colors: { header: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
  },
] as const;

export default function PlayerAnalysis({ analysis }: PlayerAnalysisProps) {
  if (!analysis) {
    return (
      <div className="rounded-2xl bg-card p-4 text-center text-sm text-text-secondary">
        Not enough data yet — play some games first!
      </div>
    );
  }

  const maxRows = Math.max(
    analysis.pros.length,
    analysis.cons.length,
    analysis.advice.length,
  );

  return (
    <div className="overflow-x-auto rounded-2xl bg-card">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`w-1/3 border-b border-separator px-3 py-2.5 text-left`}
              >
                <div className="flex items-center gap-1.5">
                  <col.icon size={14} className={col.colors.header} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${col.colors.header}`}>
                    {col.label}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, rowIdx) => (
            <motion.tr
              key={rowIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIdx * 0.05 }}
              className="border-b border-separator/30 last:border-b-0"
            >
              {columns.map((col) => {
                const item: PlayerAnalysisItem | undefined = analysis[col.key][rowIdx];
                return (
                  <td
                    key={col.key}
                    className="w-1/3 px-3 py-2.5 align-top"
                  >
                    {item ? (
                      <div>
                        <p className="text-xs font-semibold">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                          {item.detail}
                        </p>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
