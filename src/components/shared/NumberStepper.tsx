import { Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: number;
  label?: string;
}

export default function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  disabled,
  label,
}: NumberStepperProps) {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-sm text-text-secondary">{label}</span>
      )}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-separator text-ivory transition-all hover:bg-separator active:scale-95 disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span
          className={clsx(
            'flex h-9 w-11 items-center justify-center rounded-xl text-sm font-bold',
            disabled !== undefined && value === disabled
              ? 'bg-red/15 text-red ring-1 ring-red/20'
              : 'card-surface text-ivory',
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-separator text-ivory transition-all hover:bg-separator active:scale-95 disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
