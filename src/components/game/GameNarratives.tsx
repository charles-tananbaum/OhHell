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
    <div className="mt-3 space-y-2">
      <AnimatePresence mode="popLayout">
        {narratives.map((n, i) => (
          <motion.div
            key={n.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2.5 rounded-2xl border border-gold/10 bg-gold/[0.04] px-4 py-2.5"
          >
            <span className="mt-0.5 text-sm leading-none">{n.emoji}</span>
            <p className="text-xs font-medium leading-relaxed text-ivory/80">
              {n.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
