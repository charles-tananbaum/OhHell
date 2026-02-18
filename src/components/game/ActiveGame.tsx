import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Send } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Scoreboard from './Scoreboard';
import RoundFlow from './RoundFlow';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function ActiveGame() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useStore((s) => s.games.find((g) => g.id === id));
  const completeGame = useStore((s) => s.completeGame);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!game) {
    return (
      <div className="py-16 text-center text-text-secondary">
        Game not found
      </div>
    );
  }

  if (game.status === 'completed') {
    navigate(`/games/${game.id}/review`, { replace: true });
    return null;
  }

  const isLastRound =
    game.currentRoundIndex === game.roundSequence.length - 1;
  const lastRound = game.rounds[game.currentRoundIndex];
  const allRoundsComplete = isLastRound && lastRound?.status === 'complete';

  const handleSubmitGame = () => {
    completeGame(game.id);
    navigate(`/games/${game.id}/complete`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-card p-2 text-text-secondary hover:bg-card-hover"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Game</h1>
      </div>

      <Scoreboard game={game} />

      {!allRoundsComplete && (
        <RoundFlow game={game} onComplete={() => {}} />
      )}

      {allRoundsComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="rounded-2xl bg-card p-5 text-center">
            <p className="mb-1 text-base font-semibold">All rounds complete!</p>
            <p className="mb-4 text-sm text-text-secondary">
              Review the scoreboard above, then submit the game to finalize
              scores and update ELO ratings.
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green py-3 font-semibold text-black"
            >
              <Send size={18} />
              Submit Game
            </button>
          </div>
        </motion.div>
      )}

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmitGame}
        title="Submit Game"
        message="This will finalize all scores and update player ELO ratings. This cannot be undone."
        confirmLabel="Submit"
      />
    </motion.div>
  );
}
