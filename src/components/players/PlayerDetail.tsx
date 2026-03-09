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
    { label: 'Games', value: display.gamesPlayed, icon: BarChart3 },
    { label: 'Wins', value: display.gamesWon, icon: Trophy },
    { label: 'Avg Bid', value: display.avgBid, icon: Target },
    { label: 'Accuracy', value: display.bidAccuracy, icon: Target },
    { label: 'Avg Place', value: display.avgPlacement, icon: BarChart3 },
    { label: 'ELO', value: display.elo, icon: Trophy },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl card-surface p-6">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-accent/[0.04] blur-[60px]" />
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => navigate('/players')}
            className="absolute -top-1 -left-1 rounded-lg p-1.5 text-text-muted transition-all hover:text-ivory"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="ml-6">
            <Avatar name={player.name} size="xl" className="ring-2 ring-accent/15" />
          </div>
          <div>
            <h1 className="font-display text-3xl tracking-tight text-ivory">{player.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-accent font-display text-xl">{player.elo}</span>
              <span className="text-xs text-text-muted">ELO</span>
            </div>
          </div>
        </div>
      </div>

      {/* ELO Chart */}
      <div className="mb-4">
        <span className="stat-label mb-2 block pl-1">ELO History</span>
        <EloChart history={player.eloHistory} />
      </div>

      {/* Stats grid — 3 cols */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-xl card-surface p-3.5 text-center"
          >
            <span className="stat-label block mb-1.5">{stat.label}</span>
            <span className="font-display text-xl text-ivory">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Scouting Report */}
      <div className="mb-4">
        <span className="stat-label mb-2 block pl-1">Scouting Report</span>
        <PlayerAnalysis analysis={player.analysis} />
      </div>

      {/* Game history */}
      <div>
        <span className="stat-label mb-2 block pl-1">Game History</span>
        {playerGames.length === 0 ? (
          <p className="text-sm text-text-secondary pl-1">No games yet</p>
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
                className="flex items-center justify-between rounded-lg card-surface px-4 py-2.5 transition-all duration-200 hover:card-surface-hover"
              >
                <span className="text-xs text-text-secondary">
                  {new Date(game.date).toLocaleDateString()}
                </span>
                <span className="text-xs font-bold text-ivory">
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
