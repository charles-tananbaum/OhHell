import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import PlayerForm from './PlayerForm';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function PlayerList() {
  const { players, deletePlayer, addToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...players].sort((a, b) => b.elo - a.elo);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Players</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white"
        >
          <Plus size={14} />
          Add Player
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No players"
          description="Add players to start tracking stats"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add Player
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {sorted.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/players/${player.id}`}
                  className="group flex items-center justify-between rounded-2xl bg-card p-4 transition-colors hover:bg-card-hover"
                >
                  <div>
                    <p className="text-sm font-semibold">{player.name}</p>
                    <p className="text-xs text-text-secondary">
                      ELO {player.elo} · {player.stats.gamesPlayed} games
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditId(player.id);
                      }}
                      className="rounded-lg p-1.5 text-text-secondary opacity-0 hover:bg-surface group-hover:opacity-100"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteId(player.id);
                      }}
                      className="rounded-lg p-1.5 text-text-secondary opacity-0 hover:bg-surface hover:text-red group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight
                      size={16}
                      className="ml-1 text-text-secondary"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {(showForm || editId) && (
        <PlayerForm
          editId={editId ?? undefined}
          onClose={() => {
            setShowForm(false);
            setEditId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deletePlayer(deleteId);
            addToast('Player deleted');
          }
        }}
        title="Delete Player"
        message="This will remove the player and their stats. This cannot be undone."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
