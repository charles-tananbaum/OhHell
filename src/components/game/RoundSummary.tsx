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
    <div className="rounded-xl card-surface overflow-hidden">
      <div className="border-b border-separator px-5 py-3">
        <h3 className="text-sm font-bold text-ivory">
          Round {round.roundNumber} Results
        </h3>
      </div>

      <div className="p-5 space-y-2">
        {playerIds.map((id, i) => {
          const player = players.find((p) => p.id === id);
          const bid = round.bids[id];
          const tricks = round.tricksTaken[id];
          const hit = bid === tricks;
          const score = round.scores[id];

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between rounded-lg bg-surface/60 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    hit ? 'bg-green/12' : 'bg-red/12'
                  }`}
                >
                  {hit ? (
                    <Check size={12} className="text-green" />
                  ) : (
                    <X size={12} className="text-red" />
                  )}
                </div>
                <Avatar name={player?.name ?? '?'} size="sm" />
                <span className="text-sm font-medium text-ivory">{player?.name}</span>
                {id === round.dealerPlayerId && (
                  <span className="inline-flex h-4 items-center rounded bg-amber/10 px-1.5 text-[9px] font-bold text-amber">
                    D
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-text-muted">
                  bid {bid} · took {tricks}
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08 + 0.15, type: 'spring' }}
                  className={`flex h-7 min-w-[2rem] items-center justify-center rounded-full text-xs font-bold ${
                    hit
                      ? 'bg-green/10 text-green'
                      : 'bg-surface text-text-muted'
                  }`}
                >
                  +{score}
                </motion.span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-separator px-5 py-4">
        <button
          onClick={onNext}
          className="w-full rounded-xl gradient-accent py-3 text-sm font-bold text-white transition-all active:scale-[0.98]"
        >
          Next Round
        </button>
      </div>
    </div>
  );
}
