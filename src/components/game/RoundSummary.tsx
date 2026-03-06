import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Avatar from '../shared/Avatar';
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
    <div className="rounded-2xl card-surface p-4">
      <h3 className="mb-3 font-display text-base font-semibold text-ivory">
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
              className="flex items-center justify-between rounded-xl bg-separator/50 px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    hit ? 'bg-green/15' : 'bg-red/15'
                  }`}
                >
                  {hit ? (
                    <Check size={14} className="text-green" />
                  ) : (
                    <X size={14} className="text-red" />
                  )}
                </div>
                <Avatar name={player?.name ?? '?'} size="sm" />
                <span className="text-sm font-medium text-ivory">{player?.name}</span>
                {id === round.dealerPlayerId && (
                  <span className="inline-flex h-4 items-center rounded-full bg-gold/15 px-1.5 text-[9px] font-bold text-gold">
                    D
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">
                  bid {bid} · took {tricks}
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                  className={`flex h-7 min-w-[2rem] items-center justify-center rounded-lg text-sm font-bold ${
                    hit
                      ? 'bg-green/10 text-green'
                      : 'bg-separator text-text-secondary'
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
        className="mt-4 w-full rounded-2xl gradient-accent py-3 text-sm font-semibold text-white transition-all active:scale-[0.98]"
      >
        Next Round
      </button>
    </div>
  );
}
