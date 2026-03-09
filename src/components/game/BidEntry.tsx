import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Pencil } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getRestrictedBid } from '../../lib/gameLogic';
import Avatar from '../shared/Avatar';
import type { Round } from '../../types';

interface BidEntryProps {
  gameId: string;
  round: Round;
}

export default function BidEntry({ gameId, round }: BidEntryProps) {
  const players = useStore((s) => s.players);
  const submitBid = useStore((s) => s.submitBid);
  const reviseBid = useStore((s) => s.reviseBid);

  const currentBidderIndex = round.bidOrder.findIndex(
    (id) => !(id in round.bids),
  );
  const currentBidderId =
    currentBidderIndex >= 0 ? round.bidOrder[currentBidderIndex] : null;

  const isLastBidder = currentBidderIndex === round.bidOrder.length - 1;
  const restrictedBid = isLastBidder
    ? getRestrictedBid(round.cardsDealt, round.bids, round.bidOrder)
    : null;

  const currentPlayer = players.find((p) => p.id === currentBidderId);

  const [focusedBid, setFocusedBid] = useState(0);

  const handleBid = (bid: number) => {
    if (!currentBidderId) return;
    submitBid(gameId, currentBidderId, bid);
  };

  const handleRevise = (playerId: string) => {
    reviseBid(gameId, playerId);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!currentBidderId) return;
      const maxBid = round.cardsDealt;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedBid((prev) => Math.min(prev + 1, maxBid));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedBid((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (restrictedBid !== focusedBid) {
          handleBid(focusedBid);
        }
      }
    },
    [currentBidderId, round.cardsDealt, restrictedBid, focusedBid],
  );

  useEffect(() => {
    if (currentBidderId) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentBidderId, handleKeyDown]);

  return (
    <div className="rounded-xl card-surface overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-separator px-5 py-3">
        <h3 className="text-sm font-bold text-ivory">
          Bidding
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-accent">
            {round.cardsDealt} card{round.cardsDealt !== 1 ? 's' : ''}
          </span>
          <span className="text-[10px] text-text-muted">
            Dealer: {players.find((p) => p.id === round.dealerPlayerId)?.name}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Submitted bids */}
        <AnimatePresence>
          {round.bidOrder.map((id) => {
            if (!(id in round.bids)) return null;
            const player = players.find((p) => p.id === id);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2 flex items-center justify-between rounded-lg bg-surface/60 px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm">
                  <Avatar name={player?.name ?? '?'} size="sm" />
                  <span className="font-medium text-text-secondary">{player?.name}</span>
                  {id === round.dealerPlayerId && (
                    <span className="inline-flex h-4 items-center rounded bg-amber/10 px-1.5 text-[9px] font-bold text-amber">
                      D
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {round.bids[id]}
                  </span>
                  <button
                    onClick={() => handleRevise(id)}
                    className="rounded-lg p-1 text-text-muted transition-colors hover:text-accent"
                    title="Revise bid"
                  >
                    <Pencil size={11} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Current bidder — casino chip buttons */}
        {currentBidderId && (
          <motion.div
            key={currentBidderId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <Avatar name={currentPlayer?.name ?? '?'} size="md" />
              <span className="font-display text-lg text-ivory">
                {currentPlayer?.name}
              </span>
              {currentBidderId === round.dealerPlayerId && (
                <span className="inline-flex h-4 items-center rounded bg-amber/10 px-1.5 text-[9px] font-bold text-amber">
                  D
                </span>
              )}
            </div>
            {restrictedBid !== null && (
              <p className="mb-3 text-center text-xs font-medium text-red">
                Cannot bid {restrictedBid} (total would equal cards)
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2.5">
              {Array.from({ length: round.cardsDealt + 1 }, (_, i) => i).map(
                (n) => {
                  const isRestricted = restrictedBid === n;
                  return (
                    <motion.button
                      key={n}
                      onClick={() => handleBid(n)}
                      disabled={isRestricted}
                      whileTap={{ scale: 0.88 }}
                      className={clsx(
                        'flex h-14 w-14 items-center justify-center rounded-full text-base font-bold transition-all duration-200',
                        isRestricted
                          ? 'bg-red/6 text-red/25 cursor-not-allowed ring-1 ring-red/10'
                          : 'border-2 border-separator bg-surface-raised text-ivory hover:border-accent/40 hover:text-accent hover:shadow-[0_0_16px_rgba(0,212,170,0.12)]',
                        focusedBid === n && !isRestricted && 'border-accent text-accent bg-accent/8 shadow-[0_0_20px_rgba(0,212,170,0.15)]',
                      )}
                    >
                      {n}
                    </motion.button>
                  );
                },
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
