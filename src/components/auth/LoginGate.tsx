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
      <div className="flex min-h-dvh items-center justify-center bg-[#09090b]">
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
    <div className="flex min-h-dvh items-center justify-center bg-[#09090b] px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/10 blur-[100px]" />
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
          <h1 className="text-3xl font-bold tracking-tight">Oh Hell</h1>
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
              className="w-full rounded-2xl bg-white/[0.05] px-5 py-4 pr-12 text-white placeholder-text-secondary outline-none ring-1 ring-white/[0.08] transition-all focus:ring-accent/50 focus:bg-white/[0.07]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-white"
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
