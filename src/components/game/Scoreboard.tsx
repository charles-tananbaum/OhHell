import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableProperties } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculateCumulativeScores } from '../../lib/scoring';
import ScoreTable from './ScoreTable';
import type { Game } from '../../types';

interface ScoreboardProps {
  game: Game;
}

export default function Scoreboard({ game }: ScoreboardProps) {
  const players = useStore((s) => s.players);
  const [showTable, setShowTable] = useState(false);
  const cumulative = calculateCumulativeScores(game.rounds, game.playerIds);
  const sorted = [...game.playerIds].sort(
    (a, b) => (cumulative[b] || 0) - (cumulative[a] || 0),
  );

  const currentRound = game.rounds[game.currentRoundIndex];
  const dealerId = currentRound?.dealerPlayerId;
  const maxScore = Math.max(...Object.values(cumulative), 1);
  const hasCompletedRounds = game.rounds.some((r) => r.status === 'complete');

  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Scoreboard
        </h3>
        <div className="flex items-center gap-2">
          {hasCompletedRounds && (
            <button
              onClick={() => setShowTable(true)}
              className="flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[10px] font-medium text-text-secondary hover:bg-card-hover"
            >
              <TableProperties size={12} />
              Score Sheet
            </button>
          )}
          <span className="text-xs text-text-secondary">
            Round {game.currentRoundIndex + 1} / {game.roundSequence.length}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showTable && (
          <ScoreTable game={game} onClose={() => setShowTable(false)} />
        )}
      </AnimatePresence>
      <div className="space-y-2">
        {sorted.map((id, i) => {
          const player = players.find((p) => p.id === id);
          const score = cumulative[id] || 0;
          return (
            <div key={id} className="flex items-center gap-3">
              <span className="w-4 text-right text-xs font-bold text-text-secondary">
                {i + 1}
              </span>
              <span className="flex w-24 items-center gap-1 truncate text-sm font-medium">
                {player?.name}
                {id === dealerId && (
                  <span className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">D</span>
                )}
              </span>
              <div className="flex-1">
                <motion.div
                  className="h-2 rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / maxScore) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="w-8 text-right text-sm font-bold">{score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
