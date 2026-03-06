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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ivory">Players</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {players.length} registered
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-xl gradient-accent px-4 py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
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
              className="inline-flex items-center gap-1.5 rounded-xl gradient-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add Player
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5">
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
                  className="group flex items-center justify-between rounded-2xl card-surface p-4 transition-all hover:card-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={player.name} size="lg" />
                    <div>
                      <p className="text-sm font-semibold text-ivory">{player.name}</p>
                      <p className="text-xs text-text-secondary">
                        ELO {player.elo} · {player.stats.gamesPlayed} games
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
                      className="rounded-xl p-2 text-text-muted opacity-0 transition-all hover:bg-separator hover:text-ivory group-hover:opacity-100"
                    >
                      <Pencil size={14} />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteId(player.id);
                        }}
                        className="rounded-xl p-2 text-text-muted opacity-0 transition-all hover:bg-red/10 hover:text-red group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <ChevronRight
                      size={16}
                      className="ml-1 text-text-muted"
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
