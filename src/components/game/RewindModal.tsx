import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, AlertTriangle } from 'lucide-react';
import Modal from '../shared/Modal';
import { useStore } from '../../store/useStore';
import type { Game } from '../../types';

interface RewindModalProps {
  open: boolean;
  onClose: () => void;
  game: Game;
}

export default function RewindModal({ open, onClose, game }: RewindModalProps) {
  const players = useStore((s) => s.players);
  const rewindToRound = useStore((s) => s.rewindToRound);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleClose = () => {
    setSelectedRound(null);
    setConfirming(false);
    onClose();
  };

  const handleRewind = () => {
    if (selectedRound === null) return;
    rewindToRound(game.id, selectedRound);
    handleClose();
  };

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name ?? '?';

  // Show all rounds that have been played (including current)
  const roundsToShow = game.rounds.map((round, index) => {
    const isCurrent = index === game.currentRoundIndex;
    return { round, index, isCurrent };
  });

  const roundsLost = selectedRound !== null
    ? game.currentRoundIndex - selectedRound
    : 0;

  return (
    <Modal open={open} onClose={handleClose} title="Rewind Game">
      {!confirming ? (
        <>
          <p className="mb-4 text-sm text-text-secondary">
            Select a round to rewind to. That round will be reset to the bidding phase, and all subsequent rounds will be removed.
          </p>

          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {roundsToShow.map(({ round, index, isCurrent }) => {
              const isComplete = round.status === 'complete';
              const isSelected = selectedRound === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedRound(index)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                    isSelected
                      ? 'border-accent/40 bg-accent/10'
                      : 'border-separator hover:border-separator-strong hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={14} className="text-accent" />
                        </motion.div>
                      )}
                      <span className="text-sm font-medium text-ivory">
                        Round {index + 1}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({round.cardsDealt} {round.cardsDealt === 1 ? 'card' : 'cards'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="rounded bg-amber/10 px-1.5 py-0.5 text-[9px] font-bold text-amber uppercase">
                          Current
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase ${
                        isComplete ? 'text-green' : 'text-amber'
                      }`}>
                        {round.status}
                      </span>
                    </div>
                  </div>
                  {isComplete && (
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {round.bidOrder.map((pid) => (
                        <span key={pid} className="text-[11px] text-text-muted">
                          {getPlayerName(pid)}: bid {round.bids[pid]} took {round.tricksTaken[pid]}
                          {round.bids[pid] === round.tricksTaken[pid] ? ' ✓' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-separator py-3 text-sm font-semibold text-ivory transition-all hover:bg-separator"
            >
              Cancel
            </button>
            <button
              onClick={() => setConfirming(true)}
              disabled={selectedRound === null}
              className="flex-1 rounded-xl gradient-accent py-3 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-1.5">
                <RotateCcw size={14} />
                Rewind
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-5 flex flex-col items-center gap-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/10">
              <AlertTriangle size={22} className="text-amber" />
            </div>
            <p className="text-center text-sm text-text-secondary">
              This will rewind to <span className="font-bold text-ivory">Round {(selectedRound ?? 0) + 1}</span> and
              discard {roundsLost > 0
                ? ` ${roundsLost} round${roundsLost > 1 ? 's' : ''} of progress`
                : ' current progress on this round'
              }. This cannot be undone.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-xl border border-separator py-3 text-sm font-semibold text-ivory transition-all hover:bg-separator"
            >
              Back
            </button>
            <button
              onClick={handleRewind}
              className="flex-1 rounded-xl gradient-red py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Confirm Rewind
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
