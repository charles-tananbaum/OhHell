import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { loadFromDb } = useStore();
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

  return <>{children}</>;
}
