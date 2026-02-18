import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getPlacementsFromScores } from '../../lib/stats';

const PODIUM_COLORS = ['text-gold', 'text-silver', 'text-bronze'];
const PODIUM_BG = ['bg-gold/15', 'bg-silver/15', 'bg-bronze/15'];

export default function GameComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useStore((s) => s.games.find((g) => g.id === id));
  const players = useStore((s) => s.players);

  if (!game || !game.finalScores || !game.eloChanges) {
    return (
      <div className="py-16 text-center text-text-secondary">
        Game not found
      </div>
    );
  }

  const placements = getPlacementsFromScores(game.finalScores);
  const ranked = [...game.playerIds].sort(
    (a, b) => placements[a] - placements[b],
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-card p-2 text-text-secondary hover:bg-card-hover"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Game Complete</h1>
      </div>

      {/* Podium */}
      <div className="mb-6 flex items-end justify-center gap-3 pt-4">
        {ranked.slice(0, 3).map((id, i) => {
          const player = players.find((p) => p.id === id);
          const score = game.finalScores![id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center"
            >
              <div
                className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${PODIUM_BG[i]}`}
              >
                {i === 0 ? (
                  <Trophy size={24} className={PODIUM_COLORS[i]} />
                ) : (
                  <span className={`text-lg font-bold ${PODIUM_COLORS[i]}`}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold">{player?.name}</span>
              <span className="text-xs text-text-secondary">{score} pts</span>
            </motion.div>
          );
        })}
      </div>

      {/* Full standings */}
      <div className="rounded-2xl bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Standings & ELO Changes
        </h3>
        <div className="space-y-2">
          {ranked.map((id, i) => {
            const player = players.find((p) => p.id === id);
            const score = game.finalScores![id];
            const eloChange = game.eloChanges![id];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      i < 3 ? PODIUM_COLORS[i] : 'text-text-secondary'
                    }`}
                  >
                    #{placements[id]}
                  </span>
                  <span className="text-sm font-medium">{player?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{score}</span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      eloChange > 0
                        ? 'text-green'
                        : eloChange < 0
                          ? 'text-red'
                          : 'text-text-secondary'
                    }`}
                  >
                    {eloChange > 0 ? (
                      <TrendingUp size={12} />
                    ) : eloChange < 0 ? (
                      <TrendingDown size={12} />
                    ) : null}
                    {eloChange > 0 ? '+' : ''}
                    {eloChange}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          to="/"
          className="flex flex-1 items-center justify-center rounded-xl bg-card py-3 text-sm font-medium text-white hover:bg-card-hover"
        >
          Home
        </Link>
        <Link
          to={`/games/${game.id}/review`}
          className="flex flex-1 items-center justify-center rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
