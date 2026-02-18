import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Round } from '../../types';

interface TrickEntryProps {
  gameId: string;
  round: Round;
  playerIds: string[];
}

export default function TrickEntry({ gameId, round, playerIds }: TrickEntryProps) {
  const players = useStore((s) => s.players);
  const submitTricks = useStore((s) => s.submitTricks);
  const reviseBid = useStore((s) => s.reviseBid);

  const [tricks, setTricks] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    playerIds.forEach((id) => (init[id] = 0));
    return init;
  });

  const total = Object.values(tricks).reduce((a, b) => a + b, 0);
  const isValid = total === round.cardsDealt;

  const updateTrick = (id: string, delta: number) => {
    setTricks((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(round.cardsDealt, prev[id] + delta)),
    }));
  };

  const handleSubmit = () => {
    if (!isValid) return;
    submitTricks(gameId, tricks);
  };

  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Tricks · {round.cardsDealt} card{round.cardsDealt !== 1 ? 's' : ''}
        </h3>
        <span
          className={`text-xs font-medium ${
            isValid ? 'text-green' : 'text-text-secondary'
          }`}
        >
          Total: {total} / {round.cardsDealt}
        </span>
      </div>

      <div className="space-y-2">
        {playerIds.map((id) => {
          const player = players.find((p) => p.id === id);
          const bid = round.bids[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-xl bg-surface px-3 py-2"
            >
              <div>
                <span className="text-sm font-medium">{player?.name}</span>
                <span className="ml-2 text-xs text-text-secondary">
                  bid {bid}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateTrick(id, -1)}
                  disabled={tricks[id] <= 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-white disabled:opacity-20"
                >
                  <Minus size={14} />
                </button>
                <span className="flex h-8 w-8 items-center justify-center text-sm font-bold">
                  {tricks[id]}
                </span>
                <button
                  onClick={() => updateTrick(id, 1)}
                  disabled={tricks[id] >= round.cardsDealt}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-white disabled:opacity-20"
                >
                  <Plus size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => reviseBid(gameId, round.bidOrder[0])}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-card px-4 py-3 text-sm font-medium text-text-secondary hover:bg-card-hover"
        >
          <ArrowLeft size={14} />
          Revise Bids
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-30"
        >
          Submit Tricks
        </button>
      </div>
    </div>
  );
}
