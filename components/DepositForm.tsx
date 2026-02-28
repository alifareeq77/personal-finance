'use client';

import { useState, useTransition } from 'react';
import { addDeposit } from '@/lib/actions/transactions';
import { roundToIqdStep } from '@/lib/currency';
import { ar } from '@/lib/ar';

export function DepositForm({
  sources,
}: {
  sources: { id: string; name: string }[];
}) {
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? '');
  const [fxOpen, setFxOpen] = useState(false);
  const [fxFromCurrency, setFxFromCurrency] = useState('USD');
  const [fxRate, setFxRate] = useState('');
  const [fxFromAmount, setFxFromAmount] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = roundToIqdStep(Number(amount));
    if (!sourceId || amt <= 0) return;
    const formData = new FormData();
    formData.set('sourceId', sourceId);
    formData.set('amountIqd', String(amt));
    formData.set('fxEnabled', fxOpen ? 'true' : 'false');
    if (fxOpen) {
      formData.set('fxFromCurrency', fxFromCurrency);
      formData.set('fxRate', fxRate || '0');
      formData.set('fxFromAmount', fxFromAmount || '0');
    }
    startTransition(async () => {
      await addDeposit(formData);
      setAmount('');
      setFxRate('');
      setFxFromAmount('');
    });
  };

  if (sources.length === 0) {
    return (
      <div className="card-glass border-secondary/30 bg-secondary-dim p-5">
        <p className="text-secondary text-sm">{ar.deposit.addSourceFirst}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.common.source}</label>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          required
          className="input-glass"
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.deposit.amountLabel}</label>
        <input
          type="number"
          inputMode="numeric"
          min={250}
          step={250}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 14))}
          placeholder={ar.deposit.placeholder}
          required
          className="input-glass text-lg no-number-spinner"
        />
      </div>
      <details className="card-glass overflow-hidden">
        <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 text-gray-500 text-sm">
          {ar.deposit.advanced}
        </summary>
        <div className="border-t border-white/[0.08] p-4 space-y-3">
          <label className="flex items-center gap-2 text-gray-400 text-sm">
            <input type="checkbox" checked={fxOpen} onChange={(e) => setFxOpen(e.target.checked)} />
            {ar.deposit.useFx}
          </label>
          {fxOpen && (
            <>
              <div>
                <label className="text-gray-500 text-xs">{ar.deposit.fromCurrency}</label>
                <input
                  type="text"
                  value={fxFromCurrency}
                  onChange={(e) => setFxFromCurrency(e.target.value)}
                  className="input-glass mt-1 min-h-[40px] text-sm"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs">{ar.deposit.rate}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={fxRate}
                  onChange={(e) => setFxRate(e.target.value)}
                  className="input-glass mt-1 min-h-[40px] text-sm"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs">{ar.deposit.fromAmount}</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={fxFromAmount}
                  onChange={(e) => setFxFromAmount(e.target.value)}
                  className="input-glass mt-1 min-h-[40px] text-sm"
                />
              </div>
            </>
          )}
        </div>
      </details>
      <button
        type="submit"
        disabled={isPending || !amount || Number(amount) <= 0}
        className="w-full min-h-[48px] btn-glass-accent disabled:opacity-40"
      >
        {ar.common.save}
      </button>
    </form>
  );
}
