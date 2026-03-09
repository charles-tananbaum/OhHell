import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-sm leading-relaxed text-text-secondary">
        {message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-separator py-3 text-sm font-semibold text-ivory transition-all hover:bg-separator"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${
            destructive
              ? 'gradient-red hover:opacity-90'
              : 'gradient-accent hover:opacity-90'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
