import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getPlacementsFromScores } from '../../lib/stats';
import Avatar from '../shared/Avatar';

export default function GameReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useStore((s) => s.games.find((g) => g.id === id));
  const players = useStore((s) => s.players);

  if (!game) {
    return (
      <div className="py-20 text-center text-text-secondary">
        Game not found
      </div>
    );
  }

  const getName = (pid: string) =>
    players.find((p) => p.id === pid)?.name ?? '?';

  const completedRounds = game.rounds.filter((r) => r.status === 'complete');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-xl border border-separator p-2.5 text-text-secondary transition-all hover:border-separator-strong hover:text-ivory"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ivory">Game Review</h1>
          <p className="text-xs text-text-secondary">
            {new Date(game.date).toLocaleDateString()} ·{' '}
            {game.playerIds.map(getName).join(', ')}
          </p>
        </div>
      </div>

      {/* Final scores */}
      {game.finalScores && (
        <div className="mb-4 rounded-2xl card-surface p-4">
          <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">
            Final Scores
          </h3>
          {(() => {
            const placements = getPlacementsFromScores(game.finalScores!);
            const ranked = [...game.playerIds].sort(
              (a, b) => placements[a] - placements[b],
            );
            return (
              <div className="space-y-1.5">
                {ranked.map((pid) => (
                  <div
                    key={pid}
                    className="flex items-center justify-between rounded-xl bg-separator/50 px-3 py-2"
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <span className="text-xs font-bold text-text-muted">
                        #{placements[pid]}
                      </span>
                      <Avatar name={getName(pid)} size="sm" />
                      <span className="text-ivory">{getName(pid)}</span>
                    </span>
                    <span className="text-sm font-bold text-ivory">
                      {game.finalScores![pid]}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Round-by-round */}
      <div className="overflow-x-auto rounded-2xl card-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-separator-strong">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary">
                Rnd
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-text-secondary">
                Cards
              </th>
              {game.playerIds.map((pid) => (
                <th
                  key={pid}
                  className="px-3 py-2.5 text-center text-xs font-medium text-text-secondary"
                >
                  {getName(pid)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {completedRounds.map((round) => (
              <tr key={round.roundNumber} className="border-b border-separator">
                <td className="px-3 py-2 text-text-secondary">
                  {round.roundNumber}
                </td>
                <td className="px-3 py-2 text-text-muted">
                  {round.cardsDealt}
                </td>
                {game.playerIds.map((pid) => {
                  const bid = round.bids[pid];
                  const tricks = round.tricksTaken[pid];
                  const hit = bid === tricks;
                  return (
                    <td key={pid} className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          hit ? 'text-green' : 'text-red'
                        }`}
                      >
                        {hit ? <Check size={10} /> : <X size={10} />}
                        <span className="text-xs">
                          {bid}/{tricks}
                        </span>
                        <span className="ml-1 font-bold">
                          +{round.scores[pid]}
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
