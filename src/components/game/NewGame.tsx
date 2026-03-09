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
  const stepLabels = ['Select Players', 'Seat Order', 'Settings'];

  return (
    <div>
      {/* Header with back + step indicator */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 'select') navigate('/');
            else if (step === 'order') setStep('select');
            else setStep('order');
          }}
          className="rounded-lg border border-separator p-2 text-text-secondary transition-all hover:border-accent/20 hover:text-ivory"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl tracking-tight text-ivory">New Game</h1>
        </div>
      </div>

      {/* Step progress — dots + label */}
      <div className="mb-7 flex items-center gap-3">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                stepIndex > i && 'gradient-accent text-white',
                stepIndex === i && 'border-2 border-accent text-accent',
                stepIndex < i && 'border border-separator text-text-muted',
              )}
            >
              {stepIndex > i ? <Check size={12} /> : i + 1}
            </div>
            <span className={clsx(
              'text-xs font-medium transition-colors',
              stepIndex === i ? 'text-ivory' : 'text-text-muted',
            )}>
              {label}
            </span>
            {i < 2 && <div className="h-px w-4 bg-separator" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Choose players <span className="text-text-muted">({selectedIds.length} selected)</span>
              </p>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="flex items-center gap-1.5 rounded-full border border-accent/25 px-3 py-1.5 text-xs font-bold text-accent transition-all hover:bg-accent/8"
              >
                <UserPlus size={12} />
                Add
              </button>
            </div>

            {players.length === 0 ? (
              <div className="rounded-xl border border-dashed border-separator-strong p-10 text-center">
                <p className="text-sm text-text-secondary">No players yet.</p>
                <button
                  onClick={() => setShowAddPlayer(true)}
                  className="mt-4 rounded-xl gradient-accent px-5 py-2.5 text-sm font-bold text-white"
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
                        'relative flex items-center gap-2.5 rounded-xl p-3 text-left transition-all duration-200',
                        selected
                          ? 'border border-accent/25 bg-accent/[0.06]'
                          : 'card-surface hover:card-surface-hover',
                      )}
                    >
                      <Avatar name={player.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ivory">
                          {player.name}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {player.elo} ELO
                        </span>
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full gradient-accent"
                        >
                          <Check size={10} className="text-white" />
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-accent py-3.5 font-bold text-white transition-all active:scale-[0.98] disabled:opacity-25"
            >
              Continue
              <ChevronRight size={16} />
            </button>

            {showAddPlayer && (
              <PlayerForm onClose={() => setShowAddPlayer(false)} />
            )}
          </motion.div>
        )}

        {step === 'order' && (
          <motion.div
            key="order"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
          >
            <p className="mb-4 text-sm text-text-secondary">
              Drag to arrange seating
            </p>
            <div className="space-y-2">
              {orderedIds.map((id, i) => {
                const player = players.find((p) => p.id === id);
                return (
                  <motion.div
                    key={id}
                    layout
                    className="flex items-center gap-3 rounded-xl card-surface px-4 py-3"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                      {i + 1}
                    </span>
                    <Avatar name={player?.name ?? ''} size="sm" />
                    <span className="flex-1 text-sm font-semibold text-ivory">
                      {player?.name}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => movePlayer(i, -1)}
                        disabled={i === 0}
                        className="rounded-lg p-1.5 text-text-secondary transition-all hover:bg-separator disabled:opacity-20"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => movePlayer(i, 1)}
                        disabled={i === orderedIds.length - 1}
                        className="rounded-lg p-1.5 text-text-secondary transition-all hover:bg-separator disabled:opacity-20"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={goToSettings}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-accent py-3.5 font-bold text-white transition-all active:scale-[0.98]"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
          >
            <div className="space-y-4">
              {/* Max cards */}
              <div className="rounded-xl card-surface p-5">
                <label className="stat-label mb-3 block">Max cards per round</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={maxCards}
                    onChange={(e) => setMaxCards(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-accent/10 font-display text-xl text-accent">
                    {maxCards}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  {roundCount} rounds (1 → {maxCards} → 1)
                </p>
              </div>

              {/* First dealer */}
              <div className="rounded-xl card-surface p-5">
                <label className="stat-label mb-3 block">First dealer</label>
                <div className="space-y-1.5">
                  {orderedIds.map((id, i) => {
                    const player = players.find((p) => p.id === id);
                    return (
                      <button
                        key={id}
                        onClick={() => setDealerIndex(i)}
                        className={clsx(
                          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                          dealerIndex === i
                            ? 'bg-accent/8 text-accent ring-1 ring-accent/20'
                            : 'text-text-secondary hover:bg-separator hover:text-ivory',
                        )}
                      >
                        <Avatar name={player?.name ?? ''} size="sm" />
                        <span className="font-medium">{player?.name}</span>
                        {dealerIndex === i && <Check size={14} className="ml-auto text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scoring rule */}
              <div className="rounded-xl border border-separator px-4 py-3">
                <p className="stat-label mb-0.5">Scoring</p>
                <p className="text-sm font-medium text-ivory">
                  Hit = 10 + tricks · Miss = tricks taken
                </p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-green py-3.5 font-bold text-white transition-all active:scale-[0.98]"
            >
              <Sparkles size={16} />
              Start Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
