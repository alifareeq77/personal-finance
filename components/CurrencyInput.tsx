'use client';

import { formatNum } from '@/lib/currency';

type CurrencyInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  min?: number;
  maxLength?: number;
  id?: string;
};

/**
 * Currency input that displays the value with thousand separators (e.g. 1,234,567).
 * Stores and passes only digits; use the same string for controlled value.
 */
export function CurrencyInput({
  value,
  onChange,
  name,
  placeholder,
  required,
  className,
  min = 0,
  maxLength = 14,
  id,
}: CurrencyInputProps) {
  const display = value === '' ? '' : formatNum(Number(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    onChange(raw);
  };

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        id={id}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={className}
        aria-valuemin={min}
      />
      {name != null && <input type="hidden" name={name} value={value || '0'} />}
    </>
  );
}
