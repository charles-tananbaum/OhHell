import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Round } from '../../types';

interface RoundSummaryProps {
  round: Round;
  playerIds: string[];
  onNext: () => void;
}

export default function RoundSummary({
  round,
  playerIds,
  onNext,
}: RoundSummaryProps) {
  const players = useStore((s) => s.players);

  return (
    <div className="rounded-2xl bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">
        Round {round.roundNumber} Summary
      </h3>

      <div className="space-y-2">
        {playerIds.map((id, i) => {
          const player = players.find((p) => p.id === id);
          const bid = round.bids[id];
          const tricks = round.tricksTaken[id];
          const hit = bid === tricks;
          const score = round.scores[id];

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    hit ? 'bg-green/20' : 'bg-red/20'
                  }`}
                >
                  {hit ? (
                    <Check size={14} className="text-green" />
                  ) : (
                    <X size={14} className="text-red" />
                  )}
                </div>
                <span className="text-sm font-medium">{player?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary">
                  bid {bid} · took {tricks}
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                  className={`text-sm font-bold ${
                    hit ? 'text-green' : 'text-text-secondary'
                  }`}
                >
                  +{score}
                </motion.span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white"
      >
        Next Round
      </button>
    </div>
  );
}
