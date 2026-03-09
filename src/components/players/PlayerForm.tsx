import { useState } from 'react';
import { useStore } from '../../store/useStore';
import Modal from '../shared/Modal';

interface PlayerFormProps {
  onClose: () => void;
  editId?: string;
}

export default function PlayerForm({ onClose, editId }: PlayerFormProps) {
  const { addPlayer, updatePlayer, getPlayer, addToast } = useStore();
  const existing = editId ? getPlayer(editId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editId) {
      updatePlayer(editId, trimmed);
      addToast('Player updated');
    } else {
      addPlayer(trimmed);
      addToast('Player added');
    }
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={editId ? 'Edit Player' : 'New Player'}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          maxLength={30}
          autoFocus
          className="mb-5 w-full rounded-xl border border-separator-strong bg-surface/80 px-5 py-4 text-ivory placeholder-text-muted outline-none transition-all duration-300 focus:border-accent/40 focus:bg-surface-raised focus:shadow-[0_0_0_3px_rgba(0,212,170,0.08)]"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-xl gradient-accent py-3.5 font-bold text-white transition-all active:scale-[0.98] disabled:opacity-25"
        >
          {editId ? 'Save' : 'Add Player'}
        </button>
      </form>
    </Modal>
  );
}
