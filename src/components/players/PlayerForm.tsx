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
          className="mb-4 w-full rounded-xl bg-card px-4 py-3 text-white placeholder-text-secondary outline-none ring-1 ring-separator focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-30"
        >
          {editId ? 'Save' : 'Add Player'}
        </button>
      </form>
    </Modal>
  );
}
