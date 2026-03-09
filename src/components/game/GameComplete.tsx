import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getPlacementsFromScores } from '../../lib/stats';
import Avatar from '../shared/Avatar';

const PODIUM_COLORS = ['text-gold', 'text-silver', 'text-bronze'];

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
          className="rounded-lg border border-separator p-2 text-text-secondary transition-all hover:border-accent/20 hover:text-ivory"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-3xl tracking-tight text-ivory">Game Complete</h1>
      </div>

      {/* Winner spotlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="mb-8 rounded-2xl border border-gold/15 bg-gold/[0.04] p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-4"
        >
          <Trophy size={40} className="mx-auto text-gold drop-shadow-lg" />
        </motion.div>
        <Avatar name={players.find((p) => p.id === ranked[0])?.name ?? '?'} size="xl" className="mx-auto mb-3 ring-2 ring-gold/25" />
        <p className="font-display text-2xl text-gold">
          {players.find((p) => p.id === ranked[0])?.name}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {game.finalScores[ranked[0]]} points
        </p>
      </motion.div>

      {/* Full standings */}
      <div className="rounded-xl card-surface overflow-hidden">
        <div className="border-b border-separator px-5 py-3">
          <span className="stat-label">Final Standings</span>
        </div>
        <div className="p-4 space-y-2">
          {ranked.map((id, i) => {
            const player = players.find((p) => p.id === id);
            const score = game.finalScores![id];
            const eloChange = game.eloChanges![id];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between rounded-lg bg-surface/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-display text-2xl ${
                      i < 3 ? PODIUM_COLORS[i] : 'text-text-muted'
                    }`}
                  >
                    {placements[id]}
                  </span>
                  <Avatar name={player?.name ?? '?'} size="sm" />
                  <span className="text-sm font-medium text-ivory">{player?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-ivory">{score}</span>
                  <span
                    className={`flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      eloChange > 0
                        ? 'bg-green/8 text-green'
                        : eloChange < 0
                          ? 'bg-red/8 text-red'
                          : 'bg-surface text-text-secondary'
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

      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="flex flex-1 items-center justify-center rounded-xl border border-separator py-3 text-sm font-medium text-ivory transition-all hover:bg-separator"
        >
          Home
        </Link>
        <Link
          to={`/games/${game.id}/review`}
          className="flex flex-1 items-center justify-center rounded-xl gradient-accent py-3 text-sm font-bold text-white transition-all hover:opacity-90"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
