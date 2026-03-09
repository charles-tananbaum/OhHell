import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableProperties } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculateCumulativeScores } from '../../lib/scoring';
import ScoreTable from './ScoreTable';
import Avatar from '../shared/Avatar';
import type { Game } from '../../types';

interface ScoreboardProps {
  game: Game;
}

export default function Scoreboard({ game }: ScoreboardProps) {
  const players = useStore((s) => s.players);
  const [showTable, setShowTable] = useState(false);
  const cumulative = useMemo(
    () => calculateCumulativeScores(game.rounds, game.playerIds),
    [game.rounds, game.playerIds],
  );
  const sorted = useMemo(
    () => [...game.playerIds].sort((a, b) => (cumulative[b] || 0) - (cumulative[a] || 0)),
    [game.playerIds, cumulative],
  );

  const currentRound = game.rounds[game.currentRoundIndex];
  const dealerId = currentRound?.dealerPlayerId;
  const maxScore = Math.max(...Object.values(cumulative), 1);
  const hasCompletedRounds = game.rounds.some((r) => r.status === 'complete');

  return (
    <div className="rounded-xl card-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-separator px-5 py-3">
        <span className="stat-label">Scoreboard</span>
        {hasCompletedRounds && (
          <button
            onClick={() => setShowTable(true)}
            className="flex items-center gap-1.5 rounded-full border border-separator px-2.5 py-1 text-[10px] font-bold text-text-secondary transition-all hover:border-accent/20 hover:text-ivory"
          >
            <TableProperties size={11} />
            Sheet
          </button>
        )}
      </div>

      <AnimatePresence>
        {showTable && (
          <ScoreTable game={game} onClose={() => setShowTable(false)} />
        )}
      </AnimatePresence>

      <div className="p-5 space-y-3">
        {sorted.map((id, i) => {
          const player = players.find((p) => p.id === id);
          const score = cumulative[id] || 0;
          const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
          return (
            <div key={id} className="flex items-center gap-3">
              <span className="w-5 text-center text-xs font-bold text-text-muted">
                {i + 1}
              </span>
              <Avatar name={player?.name ?? '?'} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-ivory">
                    {player?.name}
                  </span>
                  {id === dealerId && (
                    <span className="inline-flex h-4 items-center rounded bg-amber/10 px-1.5 text-[9px] font-bold text-amber">
                      D
                    </span>
                  )}
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-separator">
                  <motion.div
                    className="h-full rounded-full gradient-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
              </div>
              <span className="min-w-[2.5rem] text-right font-display text-lg text-ivory">
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
