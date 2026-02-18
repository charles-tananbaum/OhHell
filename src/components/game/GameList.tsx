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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Games</h1>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="rounded-lg bg-card p-2 text-text-secondary hover:bg-card-hover"
            title="Import"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg bg-card p-2 text-text-secondary hover:bg-card-hover"
            title="Export"
          >
            <Download size={16} />
          </button>
          <Link
            to="/games/new"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus size={14} />
            New Game
          </Link>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl bg-card p-1">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-accent/15 text-accent'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {f}
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              New Game
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
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
                  className="group cursor-pointer rounded-2xl bg-card p-4 transition-colors hover:bg-card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {game.status === 'active' ? (
                          <Clock size={14} className="text-gold" />
                        ) : (
                          <CheckCircle size={14} className="text-green" />
                        )}
                        <span className="text-xs text-text-secondary">
                          {new Date(game.date).toLocaleDateString()} ·{' '}
                          {game.roundSequence.length} rounds
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium">
                        {getPlayerNames(game.playerIds)}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {game.status === 'active'
                          ? `Round ${game.currentRoundIndex + 1} of ${game.roundSequence.length}`
                          : 'Completed'}
                      </p>
                    </div>
                    {userRole === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(game.id);
                        }}
                        className="rounded-lg p-1.5 text-text-secondary opacity-0 transition-opacity hover:bg-surface hover:text-red group-hover:opacity-100"
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
