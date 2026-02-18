import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, loadFromDb } = useStore();
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromDb().then(() => setLoaded(true));
  }, [loadFromDb]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-sm text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const valid = login(input);
    if (!valid) {
      setError('Incorrect password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
            <Lock size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Oh Hell</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Enter the password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl bg-card px-4 py-3 pr-10 text-white placeholder-text-secondary outline-none ring-1 ring-separator focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Unlock
          </button>
        </form>
      </motion.div>
    </div>
  );
}
