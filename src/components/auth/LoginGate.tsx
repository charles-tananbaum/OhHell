import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Spade } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { userRole, login, loadFromDb } = useStore();
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromDb().then(() => setLoaded(true));
  }, [loadFromDb]);

  if (!loaded) {
    return (
      <div className="felt-bg flex min-h-dvh items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
            <div className="absolute inset-1.5 rounded-full bg-felt" />
          </div>
          <span className="text-sm text-text-secondary font-medium tracking-wide">Loading...</span>
        </motion.div>
      </div>
    );
  }

  if (userRole) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const valid = login(input);
    if (!valid) {
      setError('Incorrect password');
    }
  };

  return (
    <div className="felt-bg relative flex min-h-dvh items-center justify-center px-4 dot-pattern">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber/[0.04] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-14 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.4, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="absolute -inset-3 rounded-full bg-accent/10 blur-xl animate-pulse-glow" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/20 bg-surface-raised">
              <Spade size={36} className="text-accent" />
            </div>
          </motion.div>
          <h1 className="font-display text-5xl tracking-tight text-ivory">Oh Hell</h1>
          <div className="mt-3 accent-line w-16" />
          <p className="mt-4 text-sm text-text-secondary tracking-wide">
            Enter the password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl border border-separator-strong bg-surface/80 px-5 py-4 pr-12 text-ivory placeholder-text-muted outline-none transition-all duration-300 focus:border-accent/40 focus:bg-surface-raised focus:shadow-[0_0_0_3px_rgba(0,212,170,0.08)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-ivory"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl gradient-accent py-4 font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] glow-accent"
          >
            Enter
          </button>
        </form>
      </motion.div>
    </div>
  );
}
