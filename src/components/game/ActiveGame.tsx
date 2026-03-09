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
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg border border-separator p-2 text-text-secondary transition-all hover:border-accent/20 hover:text-ivory"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl tracking-tight text-ivory">Live Game</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber/10 px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse-glow" />
          <span className="text-[10px] font-bold text-amber uppercase tracking-wider">
            Round {game.currentRoundIndex + 1}/{game.roundSequence.length}
          </span>
        </div>
      </div>

      <Scoreboard game={game} />

      <GameNarratives game={game} />

      {!allRoundsComplete && (
        <RoundFlow game={game} onComplete={() => {}} />
      )}

      {allRoundsComplete && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="rounded-xl card-surface p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full gradient-gold animate-float">
              <Sparkles size={24} className="text-white" />
            </div>
            <p className="mb-1.5 font-display text-xl text-ivory">All rounds complete!</p>
            <p className="mb-6 text-sm text-text-secondary">
              Submit to finalize scores and update ELO ratings.
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-accent py-3.5 font-bold text-white transition-all active:scale-[0.98] glow-accent"
            >
              <Send size={16} />
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
