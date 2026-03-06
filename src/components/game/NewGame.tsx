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
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { generateRoundSequence } from '../../lib/gameLogic';
import PlayerForm from '../players/PlayerForm';
import Avatar from '../shared/Avatar';

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
  const stepIndex = ['select', 'order', 'settings'].indexOf(step);

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 'select') navigate('/');
            else if (step === 'order') setStep('select');
            else setStep('order');
          }}
          className="rounded-xl border border-separator p-2.5 text-text-secondary transition-all hover:border-separator-strong hover:text-ivory"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ivory">New Game</h1>
          <p className="text-xs text-text-secondary">
            Step {stepIndex + 1} of 3
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 flex gap-1.5">
        {(['select', 'order', 'settings'] as const).map((s, i) => (
          <div
            key={s}
            className="h-1 flex-1 overflow-hidden rounded-full bg-separator"
          >
            <motion.div
              className="h-full rounded-full gradient-accent"
              initial={{ width: 0 }}
              animate={{ width: stepIndex >= i ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
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
                className="flex items-center gap-1.5 rounded-xl border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent-light transition-colors hover:bg-accent/10"
              >
                <UserPlus size={14} />
                Add New
              </button>
            </div>

            {players.length === 0 ? (
              <div className="rounded-2xl card-surface p-10 text-center">
                <p className="text-sm text-text-secondary">
                  No players yet. Add some to get started.
                </p>
                <button
                  onClick={() => setShowAddPlayer(true)}
                  className="mt-4 rounded-xl gradient-accent px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Add Player
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {players.map((player) => {
                  const selected = selectedIds.includes(player.id);
                  return (
                    <motion.button
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      whileTap={{ scale: 0.97 }}
                      className={clsx(
                        'flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all',
                        selected
                          ? 'bg-accent/10 ring-1 ring-accent/30 glow-accent'
                          : 'card-surface hover:card-surface-hover',
                      )}
                    >
                      <Avatar name={player.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ivory">
                          {player.name}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          ELO {player.elo}
                        </span>
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={16} className="text-accent-light" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            <button
              onClick={goToOrder}
              disabled={selectedIds.length < 2}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-accent py-3.5 font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-30"
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
                    className="flex items-center gap-3 rounded-2xl card-surface p-3"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-separator text-xs font-bold text-text-secondary">
                      {i + 1}
                    </span>
                    <Avatar name={player?.name ?? ''} size="sm" />
                    <span className="flex-1 text-sm font-medium text-ivory">
                      {player?.name}
                    </span>
                    <button
                      onClick={() => movePlayer(i, -1)}
                      disabled={i === 0}
                      className="rounded-lg p-1.5 text-text-secondary transition-all hover:bg-separator disabled:opacity-20"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => movePlayer(i, 1)}
                      disabled={i === orderedIds.length - 1}
                      className="rounded-lg p-1.5 text-text-secondary transition-all hover:bg-separator disabled:opacity-20"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={goToSettings}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-accent py-3.5 font-semibold text-white transition-all active:scale-[0.98]"
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
              <div className="rounded-2xl card-surface p-5">
                <label className="mb-3 block text-sm font-medium text-text-secondary">
                  Max cards per round
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={maxCards}
                    onChange={(e) => setMaxCards(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="flex h-10 w-12 items-center justify-center rounded-xl bg-accent/10 text-lg font-bold text-accent-light">
                    {maxCards}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  {roundCount} total rounds (1 → {maxCards} → 1)
                </p>
              </div>

              <div className="rounded-2xl card-surface p-5">
                <label className="mb-3 block text-sm font-medium text-text-secondary">
                  First dealer
                </label>
                <div className="space-y-1.5">
                  {orderedIds.map((id, i) => {
                    const player = players.find((p) => p.id === id);
                    return (
                      <button
                        key={id}
                        onClick={() => setDealerIndex(i)}
                        className={clsx(
                          'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all',
                          dealerIndex === i
                            ? 'bg-accent/10 font-semibold text-accent-light ring-1 ring-accent/25'
                            : 'text-text-secondary hover:bg-separator hover:text-ivory',
                        )}
                      >
                        <Avatar name={player?.name ?? ''} size="sm" />
                        {dealerIndex === i && <Check size={14} />}
                        <span>{player?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl card-surface p-4">
                <p className="text-xs text-text-muted">Scoring</p>
                <p className="mt-0.5 text-sm font-medium text-ivory">
                  Exact bid = 10 + tricks · Miss = tricks taken
                </p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-green py-3.5 font-semibold text-white transition-all active:scale-[0.98] glow-accent"
            >
              <Sparkles size={18} />
              Start Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
