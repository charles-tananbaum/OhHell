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
    <div className="rounded-2xl card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ivory">
          Bidding · {round.cardsDealt} card{round.cardsDealt !== 1 ? 's' : ''}
        </h3>
        <span className="text-xs text-text-muted">
          Dealer: {players.find((p) => p.id === round.dealerPlayerId)?.name}
        </span>
      </div>

      {/* Submitted bids */}
      <AnimatePresence>
        {round.bidOrder.map((id) => {
          if (!(id in round.bids)) return null;
          const player = players.find((p) => p.id === id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-1.5 flex items-center justify-between rounded-xl bg-separator/50 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-text-secondary">
                <Avatar name={player?.name ?? '?'} size="sm" />
                {player?.name}
                {id === round.dealerPlayerId && (
                  <span className="inline-flex h-4 items-center rounded-full bg-gold/15 px-1.5 text-[9px] font-bold text-gold">
                    D
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent-light">
                  {round.bids[id]}
                </span>
                <button
                  onClick={() => handleRevise(id)}
                  className="rounded-lg p-1 text-text-muted transition-colors hover:text-accent-light"
                  title="Revise bid"
                >
                  <Pencil size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Current bidder */}
      {currentBidderId && (
        <motion.div
          key={currentBidderId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <p className="mb-3 flex items-center justify-center gap-2 font-display text-base font-semibold text-ivory">
            <Avatar name={currentPlayer?.name ?? '?'} size="sm" />
            {currentPlayer?.name}'s bid
            {currentBidderId === round.dealerPlayerId && (
              <span className="inline-flex h-4 items-center rounded-full bg-gold/15 px-1.5 text-[9px] font-bold text-gold">
                D
              </span>
            )}
          </p>
          {restrictedBid !== null && (
            <p className="mb-3 text-center text-xs text-red">
              Cannot bid {restrictedBid} (would make total = cards dealt)
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: round.cardsDealt + 1 }, (_, i) => i).map(
              (n) => {
                const isRestricted = restrictedBid === n;
                return (
                  <motion.button
                    key={n}
                    onClick={() => handleBid(n)}
                    disabled={isRestricted}
                    whileTap={{ scale: 0.9 }}
                    className={clsx(
                      'flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all',
                      isRestricted
                        ? 'bg-red/8 text-red/30 cursor-not-allowed ring-1 ring-red/10'
                        : 'card-surface text-ivory ring-1 ring-separator hover:ring-accent/40 hover:bg-accent/10 hover:text-accent-light',
                      focusedBid === n && !isRestricted && 'ring-2 ring-accent-light bg-accent/15',
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
  );
}
