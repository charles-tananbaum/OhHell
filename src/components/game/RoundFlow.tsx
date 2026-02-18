import { useStore } from '../../store/useStore';
import BidEntry from './BidEntry';
import TrickEntry from './TrickEntry';
import RoundSummary from './RoundSummary';
import type { Game } from '../../types';

interface RoundFlowProps {
  game: Game;
  onComplete: () => void;
}

export default function RoundFlow({ game }: RoundFlowProps) {
  const advanceRound = useStore((s) => s.advanceRound);
  const round = game.rounds[game.currentRoundIndex];
  if (!round) return null;

  const isLastRound = game.currentRoundIndex === game.roundSequence.length - 1;

  const handleNext = () => {
    if (!isLastRound) {
      advanceRound(game.id);
    }
    // If last round, ActiveGame shows the Submit Game button instead
  };

  return (
    <div className="mt-3">
      {round.status === 'bidding' && (
        <BidEntry gameId={game.id} round={round} />
      )}
      {round.status === 'playing' && (
        <TrickEntry
          gameId={game.id}
          round={round}
          playerIds={game.playerIds}
        />
      )}
      {round.status === 'complete' && !isLastRound && (
        <RoundSummary
          round={round}
          playerIds={game.playerIds}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
