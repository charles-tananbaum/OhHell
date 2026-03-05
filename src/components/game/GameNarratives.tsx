import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { generateGameNarratives } from '../../lib/gameNarratives';
import type { Game } from '../../types';

interface GameNarrativesProps {
  game: Game;
}

export default function GameNarratives({ game }: GameNarrativesProps) {
  const players = useStore((s) => s.players);
  const allGames = useStore((s) => s.games);

  const narratives = generateGameNarratives(game, players, allGames);

  if (narratives.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <AnimatePresence mode="popLayout">
        {narratives.map((n, i) => (
          <motion.div
            key={n.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2 rounded-xl bg-accent/10 border border-accent/20 px-3 py-2"
          >
            <span className="mt-0.5 text-sm leading-none">{n.emoji}</span>
            <p className="text-xs font-medium text-text-primary leading-relaxed">
              {n.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
