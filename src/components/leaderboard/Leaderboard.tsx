import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Crown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import EmptyState from '../shared/EmptyState';
import Avatar from '../shared/Avatar';

const RANK_STYLES = [
  { text: 'text-gold', bg: 'bg-gold/8', border: 'border-gold/15' },
  { text: 'text-silver', bg: 'bg-silver/8', border: 'border-silver/15' },
  { text: 'text-bronze', bg: 'bg-bronze/8', border: 'border-bronze/15' },
];

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
        <h1 className="mb-8 font-display text-4xl tracking-tight text-ivory">Rankings</h1>
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
      <h1 className="mb-6 font-display text-4xl tracking-tight text-ivory">Rankings</h1>

      {/* Champion card */}
      {ranked.length >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-gold/12 bg-gold/[0.03] p-6"
        >
          <div className="absolute top-3 right-4">
            <Crown size={32} className="text-gold/20" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={ranked[0].name} size="xl" className="ring-2 ring-gold/20" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full gradient-gold"
              >
                <Crown size={12} className="text-white" />
              </motion.div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold/60">#1 Ranked</p>
              <p className="font-display text-2xl text-gold">{ranked[0].name}</p>
              <p className="text-sm text-text-secondary">
                <span className="font-display text-lg text-ivory">{ranked[0].elo}</span>
                <span className="ml-1 text-text-muted">ELO</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ranked list */}
      <div className="space-y-2">
        {ranked.map((player, i) => {
          const lastEntry =
            player.eloHistory[player.eloHistory.length - 1];
          const recentChange = lastEntry
            ? lastEntry.eloAfter - lastEntry.eloBefore
            : 0;
          const style = i < 3 ? RANK_STYLES[i] : null;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link
                to={`/players/${player.id}`}
                className="flex items-center justify-between rounded-xl card-surface p-4 transition-all duration-200 hover:card-surface-hover"
              >
                <div className="flex items-center gap-3">
                  {/* Rank number — oversized for top 3 */}
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg font-display text-base ${
                      style
                        ? `${style.text} ${style.bg}`
                        : 'text-text-muted bg-separator/50'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar name={player.name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-ivory">{player.name}</p>
                    <p className="text-[10px] text-text-secondary">
                      {player.stats.gamesPlayed} games · {player.stats.gamesWon} wins
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl text-ivory">{player.elo}</p>
                  {recentChange !== 0 && (
                    <p
                      className={`flex items-center justify-end gap-0.5 text-[10px] font-bold ${
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
