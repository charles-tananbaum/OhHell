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
    <div className="rounded-2xl card-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">
          Scoreboard
        </h3>
        <div className="flex items-center gap-2">
          {hasCompletedRounds && (
            <button
              onClick={() => setShowTable(true)}
              className="flex items-center gap-1.5 rounded-lg border border-separator px-2.5 py-1 text-[10px] font-medium text-text-secondary transition-all hover:border-separator-strong hover:text-ivory"
            >
              <TableProperties size={12} />
              Score Sheet
            </button>
          )}
          <div className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent-light">
            {game.currentRoundIndex + 1} / {game.roundSequence.length}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTable && (
          <ScoreTable game={game} onClose={() => setShowTable(false)} />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {sorted.map((id, i) => {
          const player = players.find((p) => p.id === id);
          const score = cumulative[id] || 0;
          const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
          return (
            <div key={id} className="flex items-center gap-3">
              <span className="w-4 text-right text-[10px] font-bold text-text-muted">
                {i + 1}
              </span>
              <Avatar name={player?.name ?? '?'} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-ivory">
                    {player?.name}
                  </span>
                  {id === dealerId && (
                    <span className="inline-flex h-4 items-center rounded-full bg-gold/15 px-1.5 text-[9px] font-bold text-gold">
                      D
                    </span>
                  )}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-separator">
                  <motion.div
                    className="h-full rounded-full gradient-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <span className="min-w-[2rem] text-right text-sm font-bold text-ivory">
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
