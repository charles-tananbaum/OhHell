import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import EmptyState from '../shared/EmptyState';

const RANK_COLORS = ['text-gold', 'text-silver', 'text-bronze'];

export default function Leaderboard() {
  const players = useStore((s) => s.players);
  const ranked = [...players]
    .filter((p) => p.stats.gamesPlayed > 0)
    .sort((a, b) => b.elo - a.elo);

  if (ranked.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-bold">Leaderboard</h1>
        <EmptyState
          icon={Trophy}
          title="No rankings yet"
          description="Complete a game to see the leaderboard"
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Leaderboard</h1>
      <div className="space-y-2">
        {ranked.map((player, i) => {
          const lastEntry =
            player.eloHistory[player.eloHistory.length - 1];
          const recentChange = lastEntry
            ? lastEntry.eloAfter - lastEntry.eloBefore
            : 0;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/players/${player.id}`}
                className="flex items-center justify-between rounded-2xl bg-card p-4 transition-colors hover:bg-card-hover"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${
                      i < 3 ? RANK_COLORS[i] : 'text-text-secondary'
                    }`}
                  >
                    {i === 0 ? (
                      <Trophy size={18} className="text-gold" />
                    ) : (
                      `#${i + 1}`
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{player.name}</p>
                    <p className="text-xs text-text-secondary">
                      {player.stats.gamesPlayed} games ·{' '}
                      {player.stats.gamesWon} wins
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{player.elo}</p>
                  {recentChange !== 0 && (
                    <p
                      className={`flex items-center justify-end gap-0.5 text-xs ${
                        recentChange > 0 ? 'text-green' : 'text-red'
                      }`}
                    >
                      {recentChange > 0 ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {recentChange > 0 ? '+' : ''}
                      {recentChange}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
