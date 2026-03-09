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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="max-h-[85vh] w-full max-w-[95vw] overflow-auto rounded-2xl border border-separator-strong bg-surface-raised p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg text-ivory">Score Sheet</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary transition-all hover:bg-separator hover:text-ivory"
          >
            <X size={18} />
          </button>
        </div>

        {completedRounds.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            No completed rounds yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-separator-strong text-text-secondary">
                  <th className="sticky left-0 bg-surface-raised px-2 py-2.5 text-left font-bold">
                    Rnd
                  </th>
                  <th className="px-2 py-2.5 text-center font-bold">Cards</th>
                  {playerNames.map(({ id, name }) => (
                    <th
                      key={id}
                      className="min-w-[72px] px-2 py-2.5 text-center font-bold"
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
                    className="border-b border-separator"
                  >
                    <td className="sticky left-0 bg-surface-raised px-2 py-2.5 font-semibold text-ivory">
                      {round.roundNumber}
                    </td>
                    <td className="px-2 py-2.5 text-center text-text-muted">
                      {round.cardsDealt}
                    </td>
                    {game.playerIds.map((id) => {
                      const bid = round.bids[id];
                      const tricks = round.tricksTaken[id];
                      const hit = bid === tricks;
                      const score = round.scores[id];
                      const total = runningTotals[id][ri];

                      return (
                        <td key={id} className="px-2 py-2.5 text-center">
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
                            <span className={hit ? 'font-bold text-green' : 'text-text-muted'}>
                              +{score}
                            </span>
                            <span className="ml-1 text-[10px] text-text-muted">
                              ({total})
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr className="bg-separator/30 font-bold">
                  <td className="sticky left-0 bg-surface-raised px-2 py-3 text-ivory" colSpan={2}>
                    Total
                  </td>
                  {game.playerIds.map((id) => (
                    <td key={id} className="px-2 py-3 text-center text-accent">
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
