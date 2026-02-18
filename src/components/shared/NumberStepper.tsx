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
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-white transition-colors hover:bg-card-hover disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span
          className={clsx(
            'flex h-8 w-10 items-center justify-center rounded-lg text-sm font-semibold',
            disabled !== undefined && value === disabled
              ? 'bg-red/20 text-red'
              : 'bg-card text-white',
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-white transition-colors hover:bg-card-hover disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
