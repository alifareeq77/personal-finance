'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { quickAddExpense } from '@/lib/actions/transactions';
import { roundToIqdStep, formatNum } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { AmountKeypad } from './AmountKeypad';
import { SourcePicker } from './SourcePicker';

const STORAGE_KEY = 'lastUsedSourceId';
const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 10000];
const MESSAGE_DURATION_MS = 3000;
const TOAST_EXIT_MS = 200;

export function QuickAddForm({
  sources,
  sourceBalances,
}: {
  sources: { id: string; name: string }[];
  sourceBalances?: Record<string, number>;
}) {
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toastExiting, setToastExiting] = useState(false);

  const dismissToast = useCallback(() => {
    setToastExiting(true);
    const t = setTimeout(() => {
      setMessage(null);
      setToastExiting(false);
    }, TOAST_EXIT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && sources.some((s) => s.id === stored)) setSourceId(stored);
    else if (sources[0]) setSourceId(sources[0].id);
  }, [sources]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(dismissToast, MESSAGE_DURATION_MS);
    return () => clearTimeout(t);
  }, [message, dismissToast]);

  const effectiveSourceId = sourceId ?? (sources[0]?.id ?? null);

  const handleSave = () => {
    const amt = roundToIqdStep(Number(amount));
    if (!effectiveSourceId || amt <= 0) return;
    startTransition(async () => {
      const res = await quickAddExpense(amt, effectiveSourceId);
      if (!res.error) {
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, effectiveSourceId);
        setAmount('');
        setMessage({ type: 'success', text: ar.home.saved });
      } else {
        setMessage({ type: 'error', text: res.error || ar.home.saveFailed });
      }
    });
  };

  if (sources.length === 0) {
    return (
      <div className="card-glass bg-secondary-dim/50 p-5 space-y-4">
        <p className="text-secondary text-sm">{ar.home.addSourceHint}</p>
        <Link
          href="/settings/sources/new"
          className="btn-glass-accent flex min-h-[48px] items-center justify-center gap-2 rounded-xl text-sm font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          {ar.settings.newSource}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {message && (
        <div
          className="fixed left-4 right-4 top-0 z-[100] flex justify-center pointer-events-none"
          style={{ paddingTop: 'max(1rem, var(--safe-top))' }}
        >
          <div
            role="alert"
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg min-w-0 max-w-[320px] backdrop-blur-xl ${
              toastExiting ? 'animate-toast-out' : 'animate-toast-in'
            } ${
              message.type === 'success'
                ? 'bg-accent-dim text-accent shadow-[0_0_0_1px_rgba(34,197,94,0.2)]'
                : 'bg-red-500/15 text-red-300 shadow-[0_0_0_1px_rgba(248,113,113,0.2)]'
            }`}
          >
            <span className="flex-1 text-sm font-medium truncate">{message.text}</span>
            <button
              type="button"
              onClick={dismissToast}
              className="shrink-0 rounded-full p-1 text-current/70 hover:text-current hover:bg-white/10 transition-colors touch-manipulation"
              aria-label={ar.common.dismiss}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="card-glass mb-5 flex justify-center gap-1.5 p-3 pt-4">
        {QUICK_AMOUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setAmount(String(n))}
            className="btn-glass min-h-[44px] min-w-0 flex-1 px-2 text-sm font-semibold tabular-nums"
          >
            {formatNum(n)}
          </button>
        ))}
      </div>
      {sources.length > 1 && (
        <div className="card-glass p-3 overflow-visible">
          <label className="mb-2 block text-gray-500 text-sm">{ar.common.source}</label>
          <SourcePicker
            sources={sources}
            value={effectiveSourceId}
            onChange={(id) => setSourceId(id)}
            selectedBalance={effectiveSourceId ? sourceBalances?.[effectiveSourceId] : undefined}
          />
        </div>
      )}
      <AmountKeypad
        value={amount}
        onChange={setAmount}
        onSave={handleSave}
        disabled={isPending}
        saveLabel={ar.home.spend}
      />
    </div>
  );
}
