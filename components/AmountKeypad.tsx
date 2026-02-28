'use client';

import { useCallback } from 'react';
import { formatNum, parseAmountIqd } from '@/lib/currency';
import { ar } from '@/lib/ar';

function BackspaceIcon({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 12H6" />
      <path d="m9 18-6-6 6-6" />
      <path d="M2 6v12" />
    </svg>
  );
}

export function AmountKeypad({
  value,
  onChange,
  onSave,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  disabled?: boolean;
}) {
  const display = value || '0';
  const isValidStep = parseAmountIqd(Number(value || '0')) !== null;
  const handleKey = useCallback(
    (key: string) => {
      if (key === 'back') {
        onChange(value.slice(0, -1));
        return;
      }
      if (value === '0' && key !== '0') onChange(key);
      else if (value.length < 12) onChange(value + key);
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        className="card-glass min-h-[60px] px-5 py-3.5 text-left text-3xl font-semibold tabular-nums"
        dir="ltr"
        aria-live="polite"
      >
        {formatNum(Number(display))} <span className="text-gray-500 text-xl">IQD</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKey(k)}
            className="btn-glass min-h-[56px] touch-manipulation text-xl"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKey('back')}
          className="btn-glass min-h-[56px] touch-manipulation flex items-center justify-center"
          aria-label="Delete"
        >
          <BackspaceIcon size={26} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => handleKey('0')}
          className="btn-glass min-h-[56px] touch-manipulation text-xl"
        >
          0
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || !value || !isValidStep}
          className="min-h-[56px] touch-manipulation rounded-2xl text-lg font-medium btn-glass-accent disabled:opacity-40 disabled:pointer-events-none"
        >
          {ar.common.save}
        </button>
      </div>
    </div>
  );
}
