'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ar } from '@/lib/ar';

function getDefaultMonthKey() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

export function MonthPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthKey = searchParams.get('month') || getDefaultMonthKey();
  const [year, month] = monthKey.split('-').map(Number);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // YYYY-MM
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', value);
    router.push(`/transactions?${params.toString()}`);
  };

  const value = `${year}-${String(month).padStart(2, '0')}`;
  const now = new Date();
  const maxMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="month-picker" className="text-gray-500 text-sm shrink-0">
        {ar.month}
      </label>
      <input
        id="month-picker"
        type="month"
        value={value}
        max={maxMonth}
        onChange={handleChange}
        className="input-glass flex-1 min-h-[44px] no-number-spinner"
        aria-label={ar.selectMonth}
      />
    </div>
  );
}
