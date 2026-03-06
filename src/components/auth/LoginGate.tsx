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
          className="flex flex-col items-center gap-3"
        >
          <div className="h-10 w-10 animate-pulse rounded-full gradient-accent" />
          <span className="text-sm text-text-secondary">Loading...</span>
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
    <div className="felt-bg flex min-h-dvh items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl gradient-accent glow-accent"
          >
            <Spade size={40} className="text-white" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ivory">Oh Hell</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter the password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-2xl border border-separator bg-surface-raised px-5 py-4 pr-12 text-ivory placeholder-text-muted outline-none transition-all focus:border-accent/40 focus:bg-card-solid"
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
            className="w-full rounded-2xl gradient-accent py-4 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] glow-accent"
          >
            Unlock
          </button>
        </form>
      </motion.div>
    </div>
  );
}
