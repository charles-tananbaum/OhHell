import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Toast() {
  const toasts = useStore((s) => s.toasts);

  return (
    <div className="fixed bottom-20 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex items-center gap-2.5 rounded-2xl glass-strong px-4 py-3 shadow-2xl"
          >
            {toast.type === 'success' ? (
              <CheckCircle size={16} className="text-green" />
            ) : (
              <XCircle size={16} className="text-red" />
            )}
            <span className="text-sm font-medium text-ivory">
              {toast.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
