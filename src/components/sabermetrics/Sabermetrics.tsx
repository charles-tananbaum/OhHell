import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import EmptyState from '../shared/EmptyState';
import type { Player } from '../../types';

type SortKey =
  | 'name'
  | 'elo'
  | 'gp'
  | 'w'
  | 'winPct'
  | 'bidPct'
  | 'avgBid'
  | 'avgP'
  | 'rnds';

type SortDir = 'asc' | 'desc';

const columns: { key: SortKey; label: string; title: string }[] = [
  { key: 'name', label: 'Player', title: 'Player' },
  { key: 'elo', label: 'ELO', title: 'ELO Rating' },
  { key: 'gp', label: 'GP', title: 'Games Played' },
  { key: 'w', label: 'W', title: 'Wins' },
  { key: 'winPct', label: 'Win%', title: 'Win Percentage' },
  { key: 'bidPct', label: 'Bid%', title: 'Bid Accuracy' },
  { key: 'avgBid', label: 'AvgBid', title: 'Average Bid' },
  { key: 'avgP', label: 'AvgP', title: 'Average Placement' },
  { key: 'rnds', label: 'Rnds', title: 'Total Rounds' },
];

function getRawValue(player: Player, key: SortKey): number | string {
  const s = player.stats;
  switch (key) {
    case 'name':
      return player.name.toLowerCase();
    case 'elo':
      return player.elo;
    case 'gp':
      return s.gamesPlayed;
    case 'w':
      return s.gamesWon;
    case 'winPct':
      return s.gamesPlayed > 0 ? s.gamesWon / s.gamesPlayed : 0;
    case 'bidPct':
      return s.totalRoundsPlayed > 0
        ? s.totalBidsCorrect / s.totalRoundsPlayed
        : 0;
    case 'avgBid':
      return s.totalRoundsPlayed > 0
        ? s.totalBidsSum / s.totalRoundsPlayed
        : 0;
    case 'avgP':
      return s.gamesPlayed > 0 ? s.totalPlacement / s.gamesPlayed : 0;
    case 'rnds':
      return s.totalRoundsPlayed;
  }
}

function formatValue(player: Player, key: SortKey): string {
  const s = player.stats;
  switch (key) {
    case 'name':
      return player.name;
    case 'elo':
      return String(player.elo);
    case 'gp':
      return String(s.gamesPlayed);
    case 'w':
      return String(s.gamesWon);
    case 'winPct':
      return s.gamesPlayed > 0
        ? ((s.gamesWon / s.gamesPlayed) * 100).toFixed(1) + '%'
        : '-';
    case 'bidPct':
      return s.totalRoundsPlayed > 0
        ? ((s.totalBidsCorrect / s.totalRoundsPlayed) * 100).toFixed(1) + '%'
        : '-';
    case 'avgBid':
      return s.totalRoundsPlayed > 0
        ? (s.totalBidsSum / s.totalRoundsPlayed).toFixed(2)
        : '-';
    case 'avgP':
      return s.gamesPlayed > 0
        ? (s.totalPlacement / s.gamesPlayed).toFixed(1)
        : '-';
    case 'rnds':
      return String(s.totalRoundsPlayed);
  }
}

export default function Sabermetrics() {
  const players = useStore((s) => s.players);
  const userRole = useStore((s) => s.userRole);
  const recalculateAllElo = useStore((s) => s.recalculateAllElo);
  const [sortKey, setSortKey] = useState<SortKey>('elo');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(
    () => [...players].sort((a, b) => {
      const aVal = getRawValue(a, sortKey);
      const bVal = getRawValue(b, sortKey);
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      const diff = (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? diff : -diff;
    }),
    [players, sortKey, sortDir],
  );

  if (players.length === 0) {
    return (
      <div>
        <h1 className="mb-8 font-display text-4xl tracking-tight text-ivory">Stats</h1>
        <EmptyState
          icon={BarChart3}
          title="No player data"
          description="Add players and complete games to see stats"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <h1 className="font-display text-4xl tracking-tight text-ivory">Stats</h1>
        {userRole === 'admin' && (
          <button
            onClick={recalculateAllElo}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 px-3 py-1.5 text-xs font-bold text-accent transition-all hover:bg-accent/8"
          >
            <RefreshCw size={12} />
            Recalc ELO
          </button>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto rounded-xl card-surface"
      >
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-separator-strong">
              {columns.map((col) => (
                <th
                  key={col.key}
                  title={col.title}
                  onClick={() => handleSort(col.key)}
                  className={clsx(
                    'cursor-pointer select-none whitespace-nowrap px-3 py-3.5 text-left text-xs font-bold transition-colors hover:text-ivory',
                    col.key !== 'name' && 'text-right',
                    sortKey === col.key ? 'text-accent' : 'text-text-secondary',
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key &&
                      (sortDir === 'asc' ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => (
              <motion.tr
                key={player.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-separator last:border-0 transition-colors hover:bg-separator/20"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'whitespace-nowrap px-3 py-3',
                      col.key === 'name' ? 'font-semibold text-ivory' : 'text-right text-text-secondary',
                      col.key === 'elo' && 'text-accent font-bold',
                    )}
                  >
                    {formatValue(player, col.key)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
