import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getPlacementsFromScores } from '../../lib/stats';
import { calculatePerformanceScores, generateEloExplanations } from '../../lib/elo';
import type { EloExplanation } from '../../lib/elo';
import Avatar from '../shared/Avatar';
import EloBreakdown from './EloBreakdown';

export default function GameReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useStore((s) => s.games.find((g) => g.id === id));
  const players = useStore((s) => s.players);

  const explanations: Record<string, EloExplanation> = useMemo(() => {
    if (!game || !game.finalScores || !game.eloChanges) return {};

    const placements = getPlacementsFromScores(game.finalScores);
    const completedRounds = game.rounds.filter((r) => r.status === 'complete');

    const eloPlayers = game.playerIds.map((pid) => {
      const player = players.find((p) => p.id === pid);
      if (!player) return { id: pid, elo: 1000 };
      const histEntry = player.eloHistory.find((h) => h.gameId === game.id);
      return { id: pid, elo: histEntry?.eloBefore ?? player.elo };
    });

    const performanceScores = calculatePerformanceScores(
      game.playerIds,
      completedRounds,
      placements,
    );

    const playerNames: Record<string, string> = {};
    for (const pid of game.playerIds) {
      playerNames[pid] = players.find((p) => p.id === pid)?.name ?? '?';
    }

    const list = generateEloExplanations(
      eloPlayers,
      playerNames,
      performanceScores,
      placements,
      completedRounds,
      game.eloChanges,
    );

    const map: Record<string, EloExplanation> = {};
    for (const exp of list) {
      map[exp.playerId] = exp;
    }
    return map;
  }, [game, players]);

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
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg border border-separator p-2 text-text-secondary transition-all hover:border-accent/20 hover:text-ivory"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ivory">Game Review</h1>
          <p className="text-xs text-text-secondary">
            {new Date(game.date).toLocaleDateString()} · {game.playerIds.map(getName).join(', ')}
          </p>
        </div>
      </div>

      {/* Final scores with ELO */}
      {game.finalScores && (
        <div className="mb-5 rounded-xl card-surface overflow-hidden">
          <div className="border-b border-separator px-5 py-3">
            <span className="stat-label">Final Scores</span>
          </div>
          <div className="p-4 space-y-1.5">
            {(() => {
              const placements = getPlacementsFromScores(game.finalScores!);
              const ranked = [...game.playerIds].sort(
                (a, b) => placements[a] - placements[b],
              );
              return ranked.map((pid) => {
                const eloChange = game.eloChanges?.[pid];
                const explanation = explanations[pid];
                return (
                  <div
                    key={pid}
                    className="rounded-lg bg-surface/60 px-4 py-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-3 text-sm">
                        <span className="font-display text-lg text-text-muted">
                          {placements[pid]}
                        </span>
                        <Avatar name={getName(pid)} size="sm" />
                        <span className="font-medium text-ivory">{getName(pid)}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg text-ivory">
                          {game.finalScores![pid]}
                        </span>
                        {eloChange != null && (
                          <span
                            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              eloChange > 0
                                ? 'bg-green/8 text-green'
                                : eloChange < 0
                                  ? 'bg-red/8 text-red'
                                  : 'bg-surface text-text-secondary'
                            }`}
                          >
                            {eloChange > 0 ? (
                              <TrendingUp size={9} />
                            ) : eloChange < 0 ? (
                              <TrendingDown size={9} />
                            ) : null}
                            {eloChange > 0 ? '+' : ''}
                            {eloChange}
                          </span>
                        )}
                      </div>
                    </div>
                    {explanation && (
                      <div className="mt-1 ml-10">
                        <EloBreakdown explanation={explanation} />
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Round-by-round */}
      <div className="overflow-x-auto rounded-xl card-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-separator-strong">
              <th className="px-3 py-3 text-left text-xs font-bold text-text-secondary">
                Rnd
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-text-secondary">
                Cards
              </th>
              {game.playerIds.map((pid) => (
                <th
                  key={pid}
                  className="px-3 py-3 text-center text-xs font-bold text-text-secondary"
                >
                  {getName(pid)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {completedRounds.map((round) => (
              <tr key={round.roundNumber} className="border-b border-separator">
                <td className="px-3 py-2.5 font-medium text-text-secondary">
                  {round.roundNumber}
                </td>
                <td className="px-3 py-2.5 text-text-muted">
                  {round.cardsDealt}
                </td>
                {game.playerIds.map((pid) => {
                  const bid = round.bids[pid];
                  const tricks = round.tricksTaken[pid];
                  const hit = bid === tricks;
                  return (
                    <td key={pid} className="px-3 py-2.5 text-center">
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
