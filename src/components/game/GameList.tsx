import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Gamepad2,
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

  const filtered = games
    .filter((g) => filter === 'all' || g.status === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPlayerNames = (ids: string[]) =>
    ids
      .map((id) => players.find((p) => p.id === id)?.name ?? '?')
      .join(', ');

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Games</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {games.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            className="rounded-xl bg-white/[0.05] p-2.5 text-text-secondary transition-all hover:bg-white/[0.08] hover:text-white"
            title="Import"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={handleExport}
            className="rounded-xl bg-white/[0.05] p-2.5 text-text-secondary transition-all hover:bg-white/[0.08] hover:text-white"
            title="Export"
          >
            <Download size={16} />
          </button>
          <Link
            to="/games/new"
            className="flex items-center gap-1.5 rounded-xl gradient-accent px-4 py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
          >
            <Plus size={14} />
            New Game
          </Link>
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-2xl bg-white/[0.03] p-1 ring-1 ring-white/[0.06]">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative flex-1 rounded-xl py-2 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {filter === f && (
              <motion.div
                layoutId="game-filter"
                className="absolute inset-0 rounded-xl bg-white/[0.08]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{f}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="No games yet"
          description="Start a new game to begin tracking scores"
          action={
            <Link
              to="/games/new"
              className="inline-flex items-center gap-1.5 rounded-xl gradient-accent px-5 py-2.5 text-sm font-semibold text-white"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  onClick={() =>
                    navigate(
                      game.status === 'active'
                        ? `/games/${game.id}`
                        : `/games/${game.id}/review`,
                    )
                  }
                  className="group cursor-pointer rounded-2xl glass p-4 transition-all hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-2">
                        {game.status === 'active' ? (
                          <div className="flex items-center gap-1.5 rounded-full bg-gold/10 px-2 py-0.5">
                            <Clock size={12} className="text-gold" />
                            <span className="text-[10px] font-medium text-gold">
                              Active
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-full bg-green/10 px-2 py-0.5">
                            <CheckCircle size={12} className="text-green" />
                            <span className="text-[10px] font-medium text-green">
                              Complete
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] text-text-secondary">
                          {new Date(game.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="truncate text-sm font-semibold">
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
                        className="rounded-xl p-2 text-text-secondary opacity-0 transition-all hover:bg-red/10 hover:text-red group-hover:opacity-100"
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
