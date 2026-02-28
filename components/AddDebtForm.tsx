'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDebt } from '@/lib/actions/debts';
import { roundToIqdStep } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { SourcePicker } from '@/components/SourcePicker';

export function AddDebtForm({
  sources,
}: {
  sources: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [direction, setDirection] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sources[0] && !sourceId) setSourceId(sources[0].id);
  }, [sources, sourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = roundToIqdStep(Number(amount));
    if (amt <= 0) return;
    const formData = new FormData();
    formData.set('direction', direction);
    formData.set('personName', personName.trim() || ar.common.unknown);
    formData.set('amountIqd', String(amt));
    if (sourceId) formData.set('sourceId', sourceId);
    startTransition(async () => {
      const res = await addDebt(formData);
      if (!res?.error) {
        setAmount('');
        setPersonName('');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-glass mb-6 w-full min-w-0 space-y-4 p-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection('RECEIVABLE')}
          className={`flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
            direction === 'RECEIVABLE'
              ? 'bg-accent-dim border border-accent/30 text-accent'
              : 'btn-glass text-gray-400'
          }`}
        >
          {ar.debts.theyOweMe}
        </button>
        <button
          type="button"
          onClick={() => setDirection('PAYABLE')}
          className={`flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
            direction === 'PAYABLE'
              ? 'bg-red-500/25 border border-red-400/30 text-red-400'
              : 'btn-glass text-gray-400'
          }`}
        >
          {ar.debts.iOweThem}
        </button>
      </div>
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.debts.whoWith}</label>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder={ar.debts.whoPlaceholder}
          className="input-glass"
        />
      </div>
      {sources.length > 0 && (
        <div>
          <label className="mb-1.5 block text-gray-500 text-sm">
            {ar.common.source} {sources.length > 1 ? `(${ar.debts.sourceForSettlement})` : ''}
          </label>
          <div className="card-glass rounded-xl overflow-hidden">
            <SourcePicker
              sources={sources}
              value={sourceId}
              onChange={(id) => setSourceId(id)}
            />
          </div>
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.common.amount}</label>
        <input
          type="number"
          inputMode="numeric"
          min={250}
          step={250}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 14))}
          placeholder={ar.amountPlaceholderIqd}
          required
          className="input-glass no-number-spinner"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !amount || Number(amount) <= 0}
        className="w-full min-h-[48px] btn-glass-accent disabled:opacity-40"
      >
        {ar.debts.addDebt}
      </button>
    </form>
  );
}
