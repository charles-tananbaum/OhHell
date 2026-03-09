import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import PlayerForm from './PlayerForm';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';
import Avatar from '../shared/Avatar';

export default function PlayerList() {
  const { players, deletePlayer, addToast, userRole } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...players].sort((a, b) => b.elo - a.elo);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-ivory">Players</h1>
          <p className="mt-1 text-xs text-text-secondary tracking-wide">
            {players.length} registered
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-xl gradient-accent px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.97] glow-accent"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add
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
              className="inline-flex items-center gap-1.5 rounded-xl gradient-accent px-5 py-2.5 text-sm font-bold text-white"
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
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
              >
                <Link
                  to={`/players/${player.id}`}
                  className="group flex items-center justify-between rounded-xl card-surface p-4 transition-all duration-200 hover:card-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={player.name} size="lg" />
                    <div>
                      <p className="text-sm font-semibold text-ivory">{player.name}</p>
                      <p className="text-xs text-text-secondary">
                        <span className="text-accent font-bold">{player.elo}</span>
                        <span className="text-text-muted"> · </span>
                        {player.stats.gamesPlayed} games
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditId(player.id);
                      }}
                      className="rounded-lg p-2 text-text-muted opacity-0 transition-all hover:bg-separator hover:text-ivory group-hover:opacity-100"
                    >
                      <Pencil size={13} />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteId(player.id);
                        }}
                        className="rounded-lg p-2 text-text-muted opacity-0 transition-all hover:bg-red/8 hover:text-red group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <ChevronRight size={14} className="ml-1 text-text-muted" />
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
