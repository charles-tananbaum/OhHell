import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Target, BarChart3 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { computeDisplayStats } from '../../lib/stats';
import EloChart from './EloChart';
import PlayerAnalysis from './PlayerAnalysis';
import Avatar from '../shared/Avatar';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const player = useStore((s) => s.players.find((p) => p.id === id));
  const games = useStore((s) => s.games);

  if (!player) {
    return (
      <div className="py-20 text-center text-text-secondary">
        Player not found
      </div>
    );
  }

  const display = computeDisplayStats(player);
  const playerGames = games
    .filter((g) => g.playerIds.includes(player.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statCards = [
    { label: 'Games Played', value: display.gamesPlayed, icon: BarChart3 },
    { label: 'Games Won', value: display.gamesWon, icon: Trophy },
    { label: 'Avg Bid', value: display.avgBid, icon: Target },
    { label: 'Bid Accuracy', value: display.bidAccuracy, icon: Target },
    { label: 'Avg Placement', value: display.avgPlacement, icon: BarChart3 },
    { label: 'ELO', value: display.elo, icon: Trophy },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/players')}
          className="rounded-xl bg-white/[0.05] p-2.5 text-text-secondary transition-all hover:bg-white/[0.08] hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
        <Avatar name={player.name} size="lg" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{player.name}</h1>
          <p className="text-xs text-text-secondary">ELO {player.elo}</p>
        </div>
      </div>

      {/* ELO Chart */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          ELO History
        </h3>
        <EloChart history={player.eloHistory} />
      </div>

      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl glass p-3.5"
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <stat.icon size={12} className="text-text-secondary" />
              <span className="text-[10px] font-medium text-text-secondary">
                {stat.label}
              </span>
            </div>
            <span className="text-xl font-bold">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Player Analysis */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Scouting Report
        </h3>
        <PlayerAnalysis analysis={player.analysis} />
      </div>

      {/* Game history */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Game History
        </h3>
        {playerGames.length === 0 ? (
          <p className="text-sm text-text-secondary">No games yet</p>
        ) : (
          <div className="space-y-1.5">
            {playerGames.map((game) => (
              <Link
                key={game.id}
                to={
                  game.status === 'completed'
                    ? `/games/${game.id}/review`
                    : `/games/${game.id}`
                }
                className="flex items-center justify-between rounded-xl glass px-3 py-2.5 transition-all hover:bg-white/[0.06]"
              >
                <span className="text-xs text-text-secondary">
                  {new Date(game.date).toLocaleDateString()}
                </span>
                <span className="text-xs font-semibold">
                  {game.status === 'completed' && game.finalScores
                    ? `${game.finalScores[player.id]} pts`
                    : 'In progress'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
