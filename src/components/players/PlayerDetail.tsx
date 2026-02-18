import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Target, BarChart3 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { computeDisplayStats } from '../../lib/stats';
import EloChart from './EloChart';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const player = useStore((s) => s.players.find((p) => p.id === id));
  const games = useStore((s) => s.games);

  if (!player) {
    return (
      <div className="py-16 text-center text-text-secondary">
        Player not found
      </div>
    );
  }

  const display = computeDisplayStats(player);
  const playerGames = games
    .filter((g) => g.playerIds.includes(player.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/players')}
          className="rounded-lg bg-card p-2 text-text-secondary hover:bg-card-hover"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{player.name}</h1>
          <p className="text-xs text-text-secondary">ELO {player.elo}</p>
        </div>
      </div>

      {/* ELO Chart */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          ELO History
        </h3>
        <EloChart history={player.eloHistory} />
      </div>

      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {[
          { label: 'Games Played', value: display.gamesPlayed, icon: BarChart3 },
          { label: 'Games Won', value: display.gamesWon, icon: Trophy },
          { label: 'Avg Bid', value: display.avgBid, icon: Target },
          { label: 'Bid Accuracy', value: display.bidAccuracy, icon: Target },
          { label: 'Avg Placement', value: display.avgPlacement, icon: BarChart3 },
          { label: 'ELO', value: display.elo, icon: Trophy },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <stat.icon size={12} className="text-text-secondary" />
              <span className="text-[10px] text-text-secondary">
                {stat.label}
              </span>
            </div>
            <span className="text-lg font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Game history */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Game History
        </h3>
        {playerGames.length === 0 ? (
          <p className="text-sm text-text-secondary">No games yet</p>
        ) : (
          <div className="space-y-1">
            {playerGames.map((game) => (
              <Link
                key={game.id}
                to={
                  game.status === 'completed'
                    ? `/games/${game.id}/review`
                    : `/games/${game.id}`
                }
                className="flex items-center justify-between rounded-xl bg-card px-3 py-2 hover:bg-card-hover"
              >
                <span className="text-xs text-text-secondary">
                  {new Date(game.date).toLocaleDateString()}
                </span>
                <span className="text-xs font-medium">
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
