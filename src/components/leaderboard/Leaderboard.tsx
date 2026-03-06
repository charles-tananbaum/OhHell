import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Crown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import EmptyState from '../shared/EmptyState';
import Avatar from '../shared/Avatar';

const RANK_COLORS = ['text-gold', 'text-silver', 'text-bronze'];

export default function Leaderboard() {
  const players = useStore((s) => s.players);
  const ranked = useMemo(
    () => [...players]
      .filter((p) => p.stats.gamesPlayed > 0)
      .sort((a, b) => b.elo - a.elo),
    [players],
  );

  if (ranked.length === 0) {
    return (
      <div>
        <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-ivory">Leaderboard</h1>
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
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-ivory">Leaderboard</h1>

      {/* Top 3 podium */}
      {ranked.length >= 1 && (
        <div className="mb-6 flex items-end justify-center gap-3 px-2 pt-4">
          {/* Second place */}
          {ranked.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <Avatar name={ranked[1].name} size="lg" />
              <span className="mt-1.5 text-xs font-bold text-silver">
                {ranked[1].name}
              </span>
              <span className="font-display text-lg font-bold text-ivory">
                {ranked[1].elo}
              </span>
              <div className="mt-1 flex h-16 w-20 items-center justify-center rounded-t-xl bg-silver/8 border-t border-x border-silver/15">
                <span className="font-display text-2xl font-bold text-silver">2</span>
              </div>
            </motion.div>
          )}

          {/* First place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -top-4 left-1/2 -translate-x-1/2"
              >
                <Crown size={20} className="text-gold" />
              </motion.div>
              <Avatar name={ranked[0].name} size="xl" className="ring-2 ring-gold/25" />
            </div>
            <span className="mt-1.5 text-sm font-bold text-gold">
              {ranked[0].name}
            </span>
            <span className="font-display text-xl font-bold text-ivory">
              {ranked[0].elo}
            </span>
            <div className="mt-1 flex h-24 w-20 items-center justify-center rounded-t-xl bg-gold/8 border-t border-x border-gold/15">
              <Trophy size={28} className="text-gold" />
            </div>
          </motion.div>

          {/* Third place */}
          {ranked.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <Avatar name={ranked[2].name} size="lg" />
              <span className="mt-1.5 text-xs font-bold text-bronze">
                {ranked[2].name}
              </span>
              <span className="font-display text-lg font-bold text-ivory">
                {ranked[2].elo}
              </span>
              <div className="mt-1 flex h-12 w-20 items-center justify-center rounded-t-xl bg-bronze/8 border-t border-x border-bronze/15">
                <span className="font-display text-2xl font-bold text-bronze">3</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Full list */}
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
                className="flex items-center justify-between rounded-2xl card-surface p-4 transition-all hover:card-surface-hover"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      i < 3
                        ? `${RANK_COLORS[i]} bg-separator`
                        : 'text-text-muted bg-separator/50'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar name={player.name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-ivory">{player.name}</p>
                    <p className="text-[10px] text-text-secondary">
                      {player.stats.gamesPlayed} games ·{' '}
                      {player.stats.gamesWon} wins
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-ivory">{player.elo}</p>
                  {recentChange !== 0 && (
                    <p
                      className={`flex items-center justify-end gap-0.5 text-[10px] font-semibold ${
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
