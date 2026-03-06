import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getPlacementsFromScores } from '../../lib/stats';
import Avatar from '../shared/Avatar';

const PODIUM_COLORS = ['text-gold', 'text-silver', 'text-bronze'];
const PODIUM_BG = ['bg-gold/10', 'bg-silver/10', 'bg-bronze/10'];

export default function GameComplete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useStore((s) => s.games.find((g) => g.id === id));
  const players = useStore((s) => s.players);

  if (!game || !game.finalScores || !game.eloChanges) {
    return (
      <div className="py-20 text-center text-text-secondary">
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
          className="rounded-xl border border-separator p-2.5 text-text-secondary transition-all hover:border-separator-strong hover:text-ivory"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ivory">Game Complete</h1>
      </div>

      {/* Podium */}
      <div className="mb-8 flex items-end justify-center gap-4 pt-6">
        {ranked.slice(0, 3).map((id, i) => {
          const player = players.find((p) => p.id === id);
          const score = game.finalScores![id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: 'spring' }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3">
                {i === 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    <Trophy size={20} className="text-gold" />
                  </motion.div>
                )}
                <div
                  className={`flex items-center justify-center rounded-2xl ${PODIUM_BG[i]} ${
                    i === 0 ? 'h-16 w-16 ring-2 ring-gold/25' : 'h-14 w-14'
                  }`}
                >
                  <Avatar name={player?.name ?? '?'} size={i === 0 ? 'xl' : 'lg'} />
                </div>
              </div>
              <span className={`text-sm font-bold ${PODIUM_COLORS[i]}`}>
                {player?.name}
              </span>
              <span className="text-xs text-text-secondary">{score} pts</span>
            </motion.div>
          );
        })}
      </div>

      {/* Full standings */}
      <div className="rounded-2xl card-surface p-4">
        <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">
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
                className="flex items-center justify-between rounded-xl bg-separator/50 px-3 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-bold ${
                      i < 3 ? PODIUM_COLORS[i] : 'text-text-muted'
                    }`}
                  >
                    #{placements[id]}
                  </span>
                  <Avatar name={player?.name ?? '?'} size="sm" />
                  <span className="text-sm font-medium text-ivory">{player?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-ivory">{score}</span>
                  <span
                    className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      eloChange > 0
                        ? 'bg-green/10 text-green'
                        : eloChange < 0
                          ? 'bg-red/10 text-red'
                          : 'bg-separator text-text-secondary'
                    }`}
                  >
                    {eloChange > 0 ? (
                      <TrendingUp size={10} />
                    ) : eloChange < 0 ? (
                      <TrendingDown size={10} />
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

      <div className="mt-5 flex gap-3">
        <Link
          to="/"
          className="flex flex-1 items-center justify-center rounded-2xl border border-separator py-3.5 text-sm font-medium text-ivory transition-all hover:bg-separator"
        >
          Home
        </Link>
        <Link
          to={`/games/${game.id}/review`}
          className="flex flex-1 items-center justify-center rounded-2xl gradient-accent py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
