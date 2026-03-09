import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Spade,
  Clock,
  CheckCircle,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function GameList() {
  const { games, players, deleteGame, exportData, importData, addToast, userRole } =
    useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => games
      .filter((g) => filter === 'all' || g.status === filter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [games, filter],
  );

  const getPlayerNames = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => players.find((p) => p.id === id)?.name ?? '?')
        .join(', '),
    [players],
  );

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ohhell-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const success = importData(reader.result as string);
        addToast(
          success ? 'Data imported successfully' : 'Invalid import file',
          success ? 'success' : 'error',
        );
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const counts = useMemo(() => ({
    all: games.length,
    active: games.filter((g) => g.status === 'active').length,
    completed: games.filter((g) => g.status === 'completed').length,
  }), [games]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-tight text-ivory">Games</h1>
            <p className="mt-1 text-xs text-text-secondary tracking-wide">
              {games.length} total · {counts.active} live
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="rounded-lg border border-separator p-2 text-text-muted transition-all hover:border-accent/20 hover:text-ivory"
              title="Import"
            >
              <Upload size={14} />
            </button>
            <button
              onClick={handleExport}
              className="rounded-lg border border-separator p-2 text-text-muted transition-all hover:border-accent/20 hover:text-ivory"
              title="Export"
            >
              <Download size={14} />
            </button>
            <Link
              to="/games/new"
              className="flex items-center gap-1.5 rounded-xl gradient-accent px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.97] glow-accent"
            >
              <Plus size={14} strokeWidth={2.5} />
              New
            </Link>
          </div>
        </div>
      </div>

      {/* Filter tabs — pill style */}
      <div className="mb-6 flex gap-2">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'text-accent'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {filter === f && (
              <motion.div
                layoutId="game-filter"
                className="absolute inset-0 rounded-full border border-accent/20 bg-accent/[0.06]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {f}
              <span className={`text-[10px] ${filter === f ? 'text-accent/60' : 'text-text-muted'}`}>
                {counts[f]}
              </span>
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Spade}
          title="No games yet"
          description="Start a new game to begin tracking scores"
          action={
            <Link
              to="/games/new"
              className="inline-flex items-center gap-1.5 rounded-xl gradient-accent px-5 py-2.5 text-sm font-bold text-white"
            >
              <Plus size={16} />
              New Game
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
              >
                <div
                  onClick={() =>
                    navigate(
                      game.status === 'active'
                        ? `/games/${game.id}`
                        : `/games/${game.id}/review`,
                    )
                  }
                  className="group relative cursor-pointer overflow-hidden rounded-xl card-surface transition-all duration-200 hover:card-surface-hover"
                >
                  {/* Status accent bar on left */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${
                      game.status === 'active' ? 'bg-amber' : 'bg-accent'
                    }`}
                  />
                  <div className="flex items-center justify-between py-3.5 pl-5 pr-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {game.status === 'active' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber uppercase tracking-wider">
                            <Clock size={10} />
                            Live
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider">
                            <CheckCircle size={10} />
                            Done
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted">
                          {new Date(game.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="truncate text-sm font-semibold text-ivory">
                        {getPlayerNames(game.playerIds)}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {game.status === 'active'
                          ? `Round ${game.currentRoundIndex + 1} of ${game.roundSequence.length}`
                          : `${game.roundSequence.length} rounds`}
                      </p>
                    </div>
                    {userRole === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(game.id);
                        }}
                        className="rounded-lg p-2 text-text-muted opacity-0 transition-all hover:bg-red/8 hover:text-red group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteGame(deleteId);
            addToast('Game deleted');
          }
        }}
        title="Delete Game"
        message="Are you sure? This cannot be undone."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
