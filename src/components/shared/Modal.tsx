import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-xl sm:items-center"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="w-full max-w-md rounded-t-2xl border border-separator-strong bg-surface-raised p-6 shadow-2xl sm:rounded-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl text-ivory">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-text-secondary transition-all hover:bg-separator hover:text-ivory"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
