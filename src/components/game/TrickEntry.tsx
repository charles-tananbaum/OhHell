import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Avatar from '../shared/Avatar';
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
    <div className="rounded-2xl card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ivory">
          Tricks · {round.cardsDealt} card{round.cardsDealt !== 1 ? 's' : ''}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isValid
              ? 'bg-green/10 text-green'
              : 'border border-separator text-text-secondary'
          }`}
        >
          {total} / {round.cardsDealt}
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
              className="flex items-center justify-between rounded-xl bg-separator/50 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Avatar name={player?.name ?? '?'} size="sm" />
                <div>
                  <span className="text-sm font-medium text-ivory">{player?.name}</span>
                  {id === round.dealerPlayerId && (
                    <span className="ml-1.5 inline-flex h-4 items-center rounded-full bg-gold/15 px-1.5 text-[9px] font-bold text-gold">
                      D
                    </span>
                  )}
                  <span className="ml-2 text-xs text-text-muted">
                    bid {bid}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateTrick(id, -1)}
                  disabled={tricks[id] <= 0}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-separator text-ivory transition-all hover:bg-separator active:scale-95 disabled:opacity-20"
                >
                  <Minus size={14} />
                </button>
                <span className="flex h-9 w-9 items-center justify-center text-sm font-bold text-ivory">
                  {tricks[id]}
                </span>
                <button
                  onClick={() => updateTrick(id, 1)}
                  disabled={tricks[id] >= round.cardsDealt}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-separator text-ivory transition-all hover:bg-separator active:scale-95 disabled:opacity-20"
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
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-separator px-4 py-3 text-sm font-medium text-text-secondary transition-all hover:bg-separator hover:text-ivory"
        >
          <ArrowLeft size={14} />
          Revise
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="flex-1 rounded-2xl gradient-accent py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-30"
        >
          Submit Tricks
        </button>
      </div>
    </div>
  );
}
