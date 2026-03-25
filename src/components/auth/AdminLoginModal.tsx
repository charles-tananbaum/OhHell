import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminLoginModal() {
  const { userRole, login, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = userRole === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const valid = login(input);
    if (valid && useStore.getState().userRole === 'admin') {
      setOpen(false);
      setInput('');
    } else {
      setError('Incorrect admin password');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInput('');
    setError('');
    setShowPassword(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 py-2">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-accent/60 transition-colors hover:text-accent"
          >
            <Shield size={12} />
            <span>Admin</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted hover:text-red">Logout</span>
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs text-text-muted/40 transition-colors hover:text-text-muted"
          >
            <Shield size={11} />
            <span>Admin Login</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xs rounded-2xl border border-separator-strong bg-surface-raised p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute right-3 top-3 text-text-muted transition-colors hover:text-ivory"
              >
                <X size={16} />
              </button>

              <div className="mb-5 flex flex-col items-center gap-2">
                <Shield size={24} className="text-accent" />
                <h3 className="font-display text-lg text-ivory">Admin Login</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Admin password"
                    autoFocus
                    className="w-full rounded-xl border border-separator-strong bg-surface/80 px-4 py-3 pr-10 text-sm text-ivory placeholder-text-muted outline-none transition-all duration-300 focus:border-accent/40 focus:bg-surface-raised focus:shadow-[0_0_0_3px_rgba(0,212,170,0.08)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-ivory"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-xs text-red"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl gradient-accent py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] glow-accent"
                >
                  Login
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
