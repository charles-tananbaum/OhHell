import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculateCumulativeScores } from '../../lib/scoring';
import type { Game } from '../../types';

interface ScoreTableProps {
  game: Game;
  onClose: () => void;
}

export default function ScoreTable({ game, onClose }: ScoreTableProps) {
  const players = useStore((s) => s.players);
  const completedRounds = game.rounds.filter((r) => r.status === 'complete');

  const playerNames = game.playerIds.map((id) => {
    const p = players.find((pl) => pl.id === id);
    return { id, name: p?.name ?? '??' };
  });

  // Build running totals
  const runningTotals: Record<string, number[]> = {};
  game.playerIds.forEach((id) => {
    runningTotals[id] = [];
  });
  let cumulative: Record<string, number> = {};
  game.playerIds.forEach((id) => {
    cumulative[id] = 0;
  });
  for (const round of completedRounds) {
    for (const id of game.playerIds) {
      cumulative[id] += round.scores[id] || 0;
      runningTotals[id].push(cumulative[id]);
    }
  }

  const finalCumulative = calculateCumulativeScores(game.rounds, game.playerIds);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-h-[85vh] w-full max-w-[95vw] overflow-auto rounded-2xl bg-card p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Score Sheet</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary hover:bg-card-hover"
          >
            <X size={18} />
          </button>
        </div>

        {completedRounds.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            No completed rounds yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-separator text-text-secondary">
                  <th className="sticky left-0 bg-card px-2 py-1.5 text-left font-medium">
                    Rnd
                  </th>
                  <th className="px-2 py-1.5 text-center font-medium">Cards</th>
                  {playerNames.map(({ id, name }) => (
                    <th
                      key={id}
                      className="min-w-[72px] px-2 py-1.5 text-center font-medium"
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedRounds.map((round, ri) => (
                  <tr
                    key={round.roundNumber}
                    className="border-b border-separator/40"
                  >
                    <td className="sticky left-0 bg-card px-2 py-1.5 font-medium">
                      {round.roundNumber}
                    </td>
                    <td className="px-2 py-1.5 text-center text-text-secondary">
                      {round.cardsDealt}
                    </td>
                    {game.playerIds.map((id) => {
                      const bid = round.bids[id];
                      const tricks = round.tricksTaken[id];
                      const hit = bid === tricks;
                      const score = round.scores[id];
                      const total = runningTotals[id][ri];

                      return (
                        <td key={id} className="px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {hit ? (
                              <Check size={10} className="flex-shrink-0 text-green" />
                            ) : (
                              <X size={10} className="flex-shrink-0 text-red" />
                            )}
                            <span className="text-text-secondary">
                              {bid}/{tricks}
                            </span>
                          </div>
                          <div className="mt-0.5">
                            <span className={hit ? 'font-bold text-green' : 'text-text-secondary'}>
                              +{score}
                            </span>
                            <span className="ml-1 text-[10px] text-text-secondary">
                              ({total})
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="bg-surface/50 font-bold">
                  <td className="sticky left-0 bg-card px-2 py-2" colSpan={2}>
                    Total
                  </td>
                  {game.playerIds.map((id) => (
                    <td key={id} className="px-2 py-2 text-center text-accent">
                      {finalCumulative[id]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
