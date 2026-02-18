import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Check,
  UserPlus,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { generateRoundSequence } from '../../lib/gameLogic';
import PlayerForm from '../players/PlayerForm';

type Step = 'select' | 'order' | 'settings';

export default function NewGame() {
  const { players, createGame, addToast } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [maxCards, setMaxCards] = useState(10);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const movePlayer = (index: number, direction: -1 | 1) => {
    const newOrder = [...orderedIds];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setOrderedIds(newOrder);
  };

  const goToOrder = () => {
    setOrderedIds(selectedIds);
    setStep('order');
  };

  const goToSettings = () => {
    setDealerIndex(0);
    setStep('settings');
  };

  const handleStart = () => {
    const id = createGame(orderedIds, maxCards, dealerIndex);
    addToast('Game started!');
    navigate(`/games/${id}`);
  };

  const roundCount = generateRoundSequence(maxCards).length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 'select') navigate('/');
            else if (step === 'order') setStep('select');
            else setStep('order');
          }}
          className="rounded-lg bg-card p-2 text-text-secondary hover:bg-card-hover"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">New Game</h1>
      </div>

      {/* Progress */}
      <div className="mb-6 flex gap-1">
        {(['select', 'order', 'settings'] as const).map((s, i) => (
          <div
            key={s}
            className={clsx(
              'h-1 flex-1 rounded-full transition-colors',
              (['select', 'order', 'settings'] as const).indexOf(step) >= i
                ? 'bg-accent'
                : 'bg-card',
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Select players ({selectedIds.length} selected)
              </p>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="flex items-center gap-1 text-xs font-medium text-accent"
              >
                <UserPlus size={14} />
                Add New
              </button>
            </div>

            {players.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 text-center">
                <p className="text-sm text-text-secondary">
                  No players yet. Add some to get started.
                </p>
                <button
                  onClick={() => setShowAddPlayer(true)}
                  className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  Add Player
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={clsx(
                      'flex items-center gap-2 rounded-xl p-3 text-left transition-colors',
                      selectedIds.includes(player.id)
                        ? 'bg-accent/15 ring-1 ring-accent'
                        : 'bg-card hover:bg-card-hover',
                    )}
                  >
                    {selectedIds.includes(player.id) && (
                      <Check size={14} className="text-accent" />
                    )}
                    <span className="truncate text-sm font-medium">
                      {player.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={goToOrder}
              disabled={selectedIds.length < 2}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-30"
            >
              Next
              <ChevronRight size={18} />
            </button>

            {showAddPlayer && (
              <PlayerForm onClose={() => setShowAddPlayer(false)} />
            )}
          </motion.div>
        )}

        {step === 'order' && (
          <motion.div
            key="order"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <p className="mb-3 text-sm text-text-secondary">
              Arrange seat order
            </p>
            <div className="space-y-2">
              {orderedIds.map((id, i) => {
                const player = players.find((p) => p.id === id);
                return (
                  <motion.div
                    key={id}
                    layout
                    className="flex items-center gap-2 rounded-xl bg-card p-3"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs font-bold text-text-secondary">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {player?.name}
                    </span>
                    <button
                      onClick={() => movePlayer(i, -1)}
                      disabled={i === 0}
                      className="rounded-lg p-1 text-text-secondary hover:bg-surface disabled:opacity-20"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => movePlayer(i, 1)}
                      disabled={i === orderedIds.length - 1}
                      className="rounded-lg p-1 text-text-secondary hover:bg-surface disabled:opacity-20"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={goToSettings}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-white"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="space-y-4">
              <div className="rounded-2xl bg-card p-4">
                <label className="mb-2 block text-sm text-text-secondary">
                  Max cards per round
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={maxCards}
                    onChange={(e) => setMaxCards(Number(e.target.value))}
                    className="flex-1 accent-accent"
                  />
                  <span className="w-8 text-center text-lg font-bold">
                    {maxCards}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {roundCount} total rounds (1→{maxCards}→1)
                </p>
              </div>

              <div className="rounded-2xl bg-card p-4">
                <label className="mb-2 block text-sm text-text-secondary">
                  First dealer
                </label>
                <div className="space-y-1">
                  {orderedIds.map((id, i) => {
                    const player = players.find((p) => p.id === id);
                    return (
                      <button
                        key={id}
                        onClick={() => setDealerIndex(i)}
                        className={clsx(
                          'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                          dealerIndex === i
                            ? 'bg-accent/15 font-semibold text-accent'
                            : 'text-text-secondary hover:text-white',
                        )}
                      >
                        {dealerIndex === i && <Check size={14} />}
                        <span>{player?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-card p-4">
                <p className="text-xs text-text-secondary">Scoring</p>
                <p className="text-sm font-medium">
                  Exact bid = 10 + tricks · Miss = tricks taken
                </p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green py-3 font-semibold text-black"
            >
              Start Game
              <Check size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
