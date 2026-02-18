import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Pencil } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getRestrictedBid } from '../../lib/gameLogic';
import type { Round } from '../../types';

interface BidEntryProps {
  gameId: string;
  round: Round;
}

export default function BidEntry({ gameId, round }: BidEntryProps) {
  const players = useStore((s) => s.players);
  const submitBid = useStore((s) => s.submitBid);
  const reviseBid = useStore((s) => s.reviseBid);

  // Find current bidder
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

  const handleBid = (bid: number) => {
    if (!currentBidderId) return;
    submitBid(gameId, currentBidderId, bid);
  };

  const handleRevise = (playerId: string) => {
    reviseBid(gameId, playerId);
  };

  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Bidding · {round.cardsDealt} card{round.cardsDealt !== 1 ? 's' : ''}
        </h3>
        <span className="text-xs text-text-secondary">
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
              className="mb-1 flex items-center justify-between rounded-lg bg-surface px-3 py-1.5"
            >
              <span className="text-sm text-text-secondary">
                {player?.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{round.bids[id]}</span>
                <button
                  onClick={() => handleRevise(id)}
                  className="rounded p-0.5 text-text-secondary transition-colors hover:text-accent"
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
          className="mt-3"
        >
          <p className="mb-2 text-center text-sm font-medium">
            {currentPlayer?.name}'s bid
          </p>
          {restrictedBid !== null && (
            <p className="mb-2 text-center text-xs text-red">
              Cannot bid {restrictedBid} (would make total = cards dealt)
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: round.cardsDealt + 1 }, (_, i) => i).map(
              (n) => {
                const isRestricted = restrictedBid === n;
                return (
                  <button
                    key={n}
                    onClick={() => handleBid(n)}
                    disabled={isRestricted}
                    className={clsx(
                      'flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold transition-all',
                      isRestricted
                        ? 'bg-red/10 text-red/40 cursor-not-allowed'
                        : 'bg-surface text-white hover:bg-accent hover:scale-105 active:scale-95',
                    )}
                  >
                    {n}
                  </button>
                );
              },
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
