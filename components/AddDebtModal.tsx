'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ar } from '@/lib/ar';
import { AddDebtForm } from '@/components/AddDebtForm';

export function AddDebtModal({ sources }: { sources: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

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

  const modal = open && typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-debt-title"
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
          <h2 id="add-debt-title" className="text-lg font-semibold">
            {ar.debts.addDebt}
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
        <div className="p-5">
          <AddDebtForm sources={sources} onSuccess={close} />
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-[48px] rounded-2xl bg-accent-dim backdrop-blur-xl flex items-center justify-center gap-2 text-sm font-medium text-accent active:bg-accent/30 transition-colors shadow-[0_0_0_1px_rgba(34,197,94,0.12)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        {ar.debts.addDebt}
      </button>
      {modal}
    </>
  );
}
