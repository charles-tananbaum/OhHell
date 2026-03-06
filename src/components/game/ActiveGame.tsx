import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Scoreboard from './Scoreboard';
import GameNarratives from './GameNarratives';
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
      <div className="py-20 text-center text-text-secondary">
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
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-xl border border-separator p-2.5 text-text-secondary transition-all hover:border-separator-strong hover:text-ivory"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ivory">Game</h1>
          <p className="text-xs text-text-secondary">
            Round {game.currentRoundIndex + 1} of {game.roundSequence.length}
          </p>
        </div>
      </div>

      <Scoreboard game={game} />

      <GameNarratives game={game} />

      {!allRoundsComplete && (
        <RoundFlow game={game} onComplete={() => {}} />
      )}

      {allRoundsComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="rounded-2xl card-surface p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-gold">
              <Sparkles size={24} className="text-white" />
            </div>
            <p className="mb-1 font-display text-lg font-bold text-ivory">All rounds complete!</p>
            <p className="mb-5 text-sm text-text-secondary">
              Review the scoreboard above, then submit to finalize scores and
              update ELO ratings.
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-accent py-3.5 font-semibold text-white transition-all active:scale-[0.98] glow-accent"
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
