import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Crown,
  Target,
  Percent,
  Flame,
  Skull,
  Zap,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { computeGameTrophies, computeAllTimeTrophies } from '../../lib/trophies';
import type { TrophyRecord, AllTimeTrophy } from '../../lib/trophies';
import EmptyState from '../shared/EmptyState';
import Avatar from '../shared/Avatar';

const ICON_MAP: Record<string, LucideIcon> = {
  crown: Crown,
  target: Target,
  percent: Percent,
  flame: Flame,
  trophy: Trophy,
  skull: Skull,
  zap: Zap,
  award: Award,
};

const ICON_COLORS: Record<string, string> = {
  crown: 'text-gold',
  target: 'text-accent',
  percent: 'text-accent-light',
  flame: 'text-red',
  trophy: 'text-gold',
  skull: 'text-text-muted',
  zap: 'text-amber',
  award: 'text-green',
};

const ICON_BG: Record<string, string> = {
  crown: 'bg-gold/10',
  target: 'bg-accent/10',
  percent: 'bg-accent/10',
  flame: 'bg-red/10',
  trophy: 'bg-gold/10',
  skull: 'bg-text-muted/10',
  zap: 'bg-amber/10',
  award: 'bg-green/10',
};

function GameTrophyCard({
  trophy,
  index,
}: {
  trophy: TrophyRecord;
  index: number;
}) {
  const Icon = ICON_MAP[trophy.icon] ?? Trophy;
  const color = ICON_COLORS[trophy.icon] ?? 'text-accent';
  const bg = ICON_BG[trophy.icon] ?? 'bg-accent/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
    >
      <Link
        to={`/games/${trophy.gameId}/review`}
        className="flex items-start gap-4 rounded-xl card-surface p-4 transition-all duration-200 hover:card-surface-hover"
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon size={20} className={color} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ivory">{trophy.label}</p>
            <span className={`font-display text-lg ${color}`}>
              {trophy.value}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary">
            {trophy.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={trophy.playerName} size="sm" />
            <span className="text-xs font-semibold text-ivory">
              {trophy.playerName}
            </span>
            <span className="text-[10px] text-text-muted">
              {trophy.gameDate}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function AllTimeTrophyCard({
  trophy,
  index,
}: {
  trophy: AllTimeTrophy;
  index: number;
}) {
  const Icon = ICON_MAP[trophy.icon] ?? Trophy;
  const color = ICON_COLORS[trophy.icon] ?? 'text-accent';
  const bg = ICON_BG[trophy.icon] ?? 'bg-accent/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      <Link
        to={`/players/${trophy.playerId}`}
        className="flex items-start gap-4 rounded-xl card-surface p-4 transition-all duration-200 hover:card-surface-hover"
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon size={20} className={color} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ivory">{trophy.label}</p>
            <span className={`font-display text-lg ${color}`}>
              {trophy.value}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary">
            {trophy.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={trophy.playerName} size="sm" />
            <span className="text-xs font-semibold text-ivory">
              {trophy.playerName}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TrophyRoom() {
  const games = useStore((s) => s.games);
  const players = useStore((s) => s.players);

  const gameTrophies = useMemo(
    () => computeGameTrophies(games, players),
    [games, players],
  );

  const allTimeTrophies = useMemo(
    () => computeAllTimeTrophies(players),
    [players],
  );

  if (gameTrophies.length === 0 && allTimeTrophies.length === 0) {
    return (
      <div>
        <h1 className="mb-8 font-display text-4xl tracking-tight text-ivory">
          Trophy Room
        </h1>
        <EmptyState
          icon={Trophy}
          title="No trophies yet"
          description="Complete a game to start earning records"
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-4xl tracking-tight text-ivory">
        Trophy Room
      </h1>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-2xl border border-gold/12 bg-gold/[0.03] p-5"
      >
        <div className="absolute top-3 right-4">
          <Trophy size={32} className="text-gold/15" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-gold/60">
          Hall of Records
        </p>
        <p className="mt-1 font-display text-xl text-gold">
          {gameTrophies.length + allTimeTrophies.length} Records
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Single-game feats and all-time career milestones
        </p>
      </motion.div>

      {/* Game records */}
      {gameTrophies.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
            Single-Game Records
          </h2>
          <div className="space-y-2">
            {gameTrophies.map((t, i) => (
              <GameTrophyCard key={t.label} trophy={t} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All-time records */}
      {allTimeTrophies.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
            All-Time Records
          </h2>
          <div className="space-y-2">
            {allTimeTrophies.map((t, i) => (
              <AllTimeTrophyCard key={t.label} trophy={t} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
