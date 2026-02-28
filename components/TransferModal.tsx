'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { addTransfer } from '@/lib/actions/transactions';
import { roundToIqdStep } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { SourcePicker } from '@/components/SourcePicker';
import { CurrencyInput } from '@/components/CurrencyInput';

export function TransferModal({ sources }: { sources: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fromSourceId, setFromSourceId] = useState<string | null>(sources[0]?.id ?? null);
  const [toSourceId, setToSourceId] = useState<string | null>(sources[1]?.id ?? null);
  const [amount, setAmount] = useState('');
  const [isPending, startTransition] = useTransition();

  const close = useCallback(() => {
    setOpen(false);
    setAmount('');
  }, []);

  useEffect(() => {
    if (open && sources.length >= 2 && !fromSourceId) setFromSourceId(sources[0].id);
    if (open && sources.length >= 2 && !toSourceId) setToSourceId(sources[1].id);
  }, [open, sources, fromSourceId, toSourceId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = roundToIqdStep(Number(amount));
    if (amt <= 0 || !fromSourceId || !toSourceId || fromSourceId === toSourceId) return;
    const formData = new FormData();
    formData.set('fromSourceId', fromSourceId);
    formData.set('toSourceId', toSourceId);
    formData.set('amountIqd', String(amt));
    startTransition(async () => {
      const res = await addTransfer(formData);
      if (!res?.error) {
        router.refresh();
        close();
      }
    });
  };

  const toSources = sources.filter((s) => s.id !== fromSourceId);
  const fromSources = sources.filter((s) => s.id !== toSourceId);

  if (sources.length < 2) return null;

  const modal = open && typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden
        onClick={close}
      />
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[var(--color-primary-muted)] shadow-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between gap-3 px-4 py-3 bg-[var(--color-primary-muted)] z-10 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">
          <h2 id="transfer-title" className="text-lg font-semibold">
            {ar.transactions.transferBetween}
          </h2>
          <button
            type="button"
            onClick={close}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={ar.common.dismiss}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactions.fromSource}</label>
            <div className="card-glass rounded-xl overflow-hidden">
              <SourcePicker
                sources={fromSources.length ? fromSources : sources}
                value={fromSourceId}
                onChange={(id) => setFromSourceId(id)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactions.toSource}</label>
            <div className="card-glass rounded-xl overflow-hidden">
              <SourcePicker
                sources={toSources.length ? toSources : sources}
                value={toSourceId}
                onChange={(id) => setToSourceId(id)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.common.amount}</label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder={ar.amountPlaceholderIqd}
              required
              className="input-glass no-number-spinner"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !amount || Number(amount) <= 0 || fromSourceId === toSourceId}
            className="w-full min-h-[48px] btn-glass-accent disabled:opacity-40"
          >
            {ar.transactions.transfer}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 min-h-[44px] rounded-2xl bg-secondary/20 backdrop-blur-xl flex items-center justify-center text-sm font-medium text-secondary active:bg-secondary/30 transition-colors shadow-[0_0_0_1px_rgba(167,139,250,0.15)]"
      >
        {ar.transactions.transfer}
      </button>
      {modal}
    </>
  );
}
