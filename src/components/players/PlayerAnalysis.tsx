import { motion } from 'framer-motion';
import { Zap, AlertTriangle, Lightbulb } from 'lucide-react';
import { generatePlayerAnalysis } from '../../lib/playerAnalysis';
import type { Player, Game } from '../../types';

interface PlayerAnalysisProps {
  player: Player;
  games: Game[];
}

const iconMap = {
  strength: Zap,
  weakness: AlertTriangle,
  tip: Lightbulb,
} as const;

const colorMap = {
  strength: { bg: 'bg-green/10', text: 'text-green', border: 'border-green/20' },
  weakness: { bg: 'bg-red/10', text: 'text-red', border: 'border-red/20' },
  tip: { bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/20' },
} as const;

const labelMap = {
  strength: 'Strength',
  weakness: 'Weakness',
  tip: 'Pro Tip',
} as const;

export default function PlayerAnalysis({ player, games }: PlayerAnalysisProps) {
  const insights = generatePlayerAnalysis(player, games);

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-4 text-center text-sm text-text-secondary">
        Not enough data yet — play some games first!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => {
        const Icon = iconMap[insight.type];
        const colors = colorMap[insight.type];
        const label = labelMap[insight.type];

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border ${colors.border} ${colors.bg} p-3`}
          >
            <div className="mb-1 flex items-center gap-2">
              <Icon size={14} className={colors.text} />
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${colors.text}`}>
                {label}
              </span>
            </div>
            <p className="text-sm font-semibold">{insight.title}</p>
            <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
              {insight.detail}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
