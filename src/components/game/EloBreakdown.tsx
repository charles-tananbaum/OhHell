import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import type { EloExplanation } from '../../lib/elo';

interface EloBreakdownProps {
  explanation: EloExplanation;
}

function ScoreBar({ label, value, maxValue = 1 }: { label: string; value: number; maxValue?: number }) {
  const pct = Math.min(100, (value / maxValue) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-[11px] text-text-muted">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-separator overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <span className="w-10 text-right text-[11px] font-mono text-ivory">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-text-muted">{label}</span>
      <span className="text-[11px] font-medium text-ivory">{value}</span>
    </div>
  );
}

export default function EloBreakdown({ explanation }: EloBreakdownProps) {
  const [open, setOpen] = useState(false);
  const e = explanation;

  const changeSign = e.eloChange > 0 ? '+' : '';
  const changeColor =
    e.eloChange > 0 ? 'text-green' : e.eloChange < 0 ? 'text-red' : 'text-text-secondary';

  const outperformed = e.actualOutcome > e.expectedOutcome;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[10px] text-text-muted transition-colors hover:text-accent"
      >
        <Info size={10} />
        <span>Why?</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={10} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg border border-separator bg-surface/60 p-3 space-y-3">
              {/* Summary sentence */}
              <p className="text-[11px] leading-relaxed text-text-secondary">
                <span className="text-ivory font-medium">{e.playerName}</span> placed{' '}
                <span className="text-ivory font-medium">
                  {e.placement === 1 ? '1st' : e.placement === 2 ? '2nd' : e.placement === 3 ? '3rd' : `${e.placement}th`}
                </span>{' '}
                in a {e.playerCount}-player, {e.totalRounds}-round game.{' '}
                {outperformed
                  ? 'They outperformed expectations based on ELO ratings.'
                  : 'They underperformed relative to ELO expectations.'}
              </p>

              {/* Performance components */}
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Performance Score
                </span>
                <div className="mt-1.5 space-y-1.5">
                  <ScoreBar label="Placement (65%)" value={e.placementScore} />
                  <ScoreBar label="Bid Accuracy (25%)" value={e.bidAccuracyScore} />
                  <ScoreBar label="Ambition (10%)" value={e.ambitionScore} />
                </div>
                <div className="mt-1.5 flex items-center justify-between border-t border-separator pt-1.5">
                  <span className="text-[11px] text-text-muted">Composite</span>
                  <span className="text-[11px] font-bold text-ivory">
                    {(e.performanceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* ELO context */}
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  ELO Context
                </span>
                <div className="mt-1.5">
                  <StatRow label="Their ELO (before)" value={String(e.eloBefore)} />
                  <StatRow label="Avg opponent ELO" value={String(e.avgOpponentElo)} />
                  <StatRow
                    label="Expected outcome"
                    value={`${(e.expectedOutcome * 100).toFixed(0)}%`}
                  />
                  <StatRow
                    label="Actual outcome"
                    value={`${(e.actualOutcome * 100).toFixed(0)}%`}
                  />
                </div>
              </div>

              {/* Multipliers */}
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Game Multipliers
                </span>
                <div className="mt-1.5">
                  <StatRow
                    label={`Player count (${e.playerCount})`}
                    value={`${e.playerCountMultiplier.toFixed(2)}×`}
                  />
                  <StatRow
                    label={`Round count (${e.totalRounds})`}
                    value={`${e.roundCountMultiplier.toFixed(2)}×`}
                  />
                </div>
              </div>

              {/* Final result */}
              <div className="rounded-lg bg-surface-raised px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] text-text-secondary">ELO Change</span>
                <span className={`font-display text-lg ${changeColor}`}>
                  {changeSign}{e.eloChange}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
