'use client';

import { useState, useTransition } from 'react';
import { addWithdraw } from '@/lib/actions/transactions';
import { roundToIqdStep } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { SourcePicker } from '@/components/SourcePicker';

export function WithdrawForm({
  sources,
}: {
  sources: { id: string; name: string }[];
}) {
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState<string | null>(sources[0]?.id ?? null);
  const [fxOpen, setFxOpen] = useState(false);
  const [fxFromCurrency, setFxFromCurrency] = useState('USD');
  const [fxRate, setFxRate] = useState('');
  const [fxFromAmount, setFxFromAmount] = useState('');
  const [isPending, startTransition] = useTransition();

  const effectiveSourceId = sourceId ?? sources[0]?.id ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = roundToIqdStep(Number(amount));
    if (!effectiveSourceId || amt <= 0) return;
    const formData = new FormData();
    formData.set('sourceId', effectiveSourceId);
    formData.set('amountIqd', String(amt));
    formData.set('fxEnabled', fxOpen ? 'true' : 'false');
    if (fxOpen) {
      formData.set('fxFromCurrency', fxFromCurrency);
      formData.set('fxRate', fxRate || '0');
      formData.set('fxFromAmount', fxFromAmount || '0');
    }
    startTransition(async () => {
      await addWithdraw(formData);
      setAmount('');
      setFxRate('');
      setFxFromAmount('');
    });
  };

  if (sources.length === 0) {
    return (
      <div className="card-glass border-secondary/30 bg-secondary-dim p-5">
        <p className="text-secondary text-sm">{ar.withdraw.addSourceFirst}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.common.source}</label>
        <div className="card-glass rounded-xl overflow-hidden">
          <SourcePicker
            sources={sources}
            value={sourceId}
            onChange={(id) => setSourceId(id)}
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.withdraw.amountLabel}</label>
        <input
          type="number"
          inputMode="numeric"
          min={250}
          step={250}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 14))}
          placeholder={ar.withdraw.placeholder}
          required
          className="input-glass text-lg no-number-spinner"
        />
      </div>
      <details className="card-glass overflow-hidden">
        <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 text-gray-500 text-sm">
          {ar.withdraw.advanced}
        </summary>
        <div className="border-t border-white/[0.08] p-4 space-y-3">
          <label className="flex items-center gap-2 text-gray-400 text-sm">
            <input type="checkbox" checked={fxOpen} onChange={(e) => setFxOpen(e.target.checked)} />
            {ar.withdraw.useFx}
          </label>
          {fxOpen && (
            <>
              <div>
                <label className="text-gray-500 text-xs">{ar.withdraw.fromCurrency}</label>
                <input
                  type="text"
                  value={fxFromCurrency}
                  onChange={(e) => setFxFromCurrency(e.target.value)}
                  className="input-glass mt-1 min-h-[40px] text-sm"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs">{ar.withdraw.rate}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={fxRate}
                  onChange={(e) => setFxRate(e.target.value)}
                  className="input-glass mt-1 min-h-[40px] text-sm"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs">{ar.withdraw.fromAmount}</label>
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
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending || !amount || Number(amount) <= 0}
          className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-full bg-red-500 text-sm font-semibold text-white shadow-md shadow-red-500/20 disabled:opacity-40 active:scale-[0.98] active:bg-red-600 transition-all"
        >
          {ar.withdraw.save}
        </button>
      </div>
    </form>
  );
}
