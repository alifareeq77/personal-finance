'use client';

import { useState, useTransition, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateTransaction } from '@/lib/actions/transactions';
import { formatNum } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { CurrencyInput } from '@/components/CurrencyInput';
import { SourcePicker } from '@/components/SourcePicker';

const KIND_LABELS: Record<string, string> = {
  EXPENSE: ar.transactions.expense,
  INCOME: ar.transactions.income,
  DEPOSIT: ar.transactions.depositKind,
  WITHDRAW: ar.transactions.withdrawKind,
  TRANSFER: ar.transactions.transfer,
};

function kindColor(kind: string) {
  if (kind === 'INCOME' || kind === 'DEPOSIT') return 'text-accent';
  if (kind === 'EXPENSE' || kind === 'WITHDRAW') return 'text-red-400';
  return 'text-gray-300';
}

type Transaction = {
  id: string;
  kind: string;
  amountIqd: number;
  sourceId: string;
  date: Date;
  note: string | null;
  fxEnabled: boolean;
  fxFromCurrency: string | null;
  fxToCurrency: string | null;
  fxRate: number | null;
  fxFromAmount: number | null;
  source: { id: string; name: string };
};

export function TransactionDetail({
  transaction,
  sources,
  dateStr,
}: {
  transaction: Transaction;
  sources: { id: string; name: string }[];
  dateStr: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState(transaction.kind);
  const [sourceId, setSourceId] = useState(transaction.sourceId);
  const [isPending, startTransition] = useTransition();
  const [kindOpen, setKindOpen] = useState(false);
  const kindTriggerRef = useRef<HTMLButtonElement>(null);
  const kindDropdownRef = useRef<HTMLUListElement | null>(null);
  const [kindDropdownRect, setKindDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (editing) setAmount(String(transaction.amountIqd));
  }, [editing, transaction.amountIqd]);
  useEffect(() => {
    if (editing) {
      setKind(transaction.kind);
      setSourceId(transaction.sourceId);
    }
  }, [editing, transaction.kind, transaction.sourceId]);

  useLayoutEffect(() => {
    if (!kindOpen) {
      setKindDropdownRect(null);
      return;
    }
    const trigger = kindTriggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setKindDropdownRect({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, [kindOpen]);

  useEffect(() => {
    if (!kindOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inTrigger = kindTriggerRef.current?.contains(target);
      const inDropdown = kindDropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) setKindOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [kindOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateTransaction(transaction.id, formData);
      if (!res.error) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.type}</label>
          <div className="relative">
            <input type="hidden" name="kind" value={kind} />
            <button
              ref={kindTriggerRef}
              type="button"
              onClick={() => setKindOpen((o) => !o)}
              className="select-trigger-inset w-full text-left flex items-center min-h-[44px] pr-10 pl-4"
              aria-haspopup="listbox"
              aria-expanded={kindOpen}
              aria-label={ar.transactionDetail.type}
            >
              <span>{KIND_LABELS[kind] ?? kind}</span>
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200"
                style={{ transform: kindOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)' }}
                aria-hidden
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#e5e7eb" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {kindOpen &&
              kindDropdownRect &&
              typeof document !== 'undefined' &&
              createPortal(
                <ul
                  ref={kindDropdownRef}
                  role="listbox"
                  className="fixed z-[9999] max-h-[min(280px,60vh)] list-none overflow-y-auto overflow-x-hidden rounded-xl bg-primary-muted p-0 shadow-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl"
                  style={{
                    top: kindDropdownRect.top,
                    left: kindDropdownRect.left,
                    width: kindDropdownRect.width,
                    WebkitBackdropFilter: 'blur(20px)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {Object.entries(KIND_LABELS).map(([value, label]) => (
                    <li key={value} role="option" aria-selected={kind === value} className="block shadow-[0_1px_0_0_rgba(255,255,255,0.03)] last:shadow-none">
                      <button
                        type="button"
                        onClick={() => {
                          setKind(value);
                          setKindOpen(false);
                        }}
                        className="block w-full min-h-[44px] px-4 py-2.5 text-left text-base text-white transition-colors active:bg-white/10"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>,
                document.body
              )}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.amount}</label>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            name="amountIqd"
            required
            placeholder={ar.amountPlaceholder}
            className="input-glass no-number-spinner"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.source}</label>
          <input type="hidden" name="sourceId" value={sourceId} />
          <div className="card-glass rounded-xl overflow-hidden">
            <SourcePicker
              sources={sources}
              value={sourceId}
              onChange={(id) => setSourceId(id ?? '')}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.date}</label>
          <input
            type="date"
            name="date"
            defaultValue={dateStr}
            required
            className="input-glass"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.note}</label>
          <input
            type="text"
            name="note"
            defaultValue={transaction.note ?? ''}
            placeholder={ar.transactionDetail.notePlaceholder}
            className="input-glass"
          />
        </div>
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="btn-glass flex-1 min-h-[48px] rounded-2xl"
          >
            {ar.common.cancel}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 min-h-[48px] btn-glass-accent rounded-2xl disabled:opacity-40"
          >
            {isPending ? ar.transactionDetail.saving : ar.transactionDetail.save}
          </button>
        </div>
      </form>
    );
  }

  const isOut = transaction.kind === 'EXPENSE' || transaction.kind === 'WITHDRAW';
  const amountDisplay = `${isOut ? '-' : ''}${formatNum(transaction.amountIqd)} د.ع`;

  return (
    <div className="space-y-4">
      <div className="card-glass p-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-lg font-semibold ${kindColor(transaction.kind)}`}>
              {KIND_LABELS[transaction.kind] ?? transaction.kind}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums" dir="ltr">
              {amountDisplay}
            </p>
          </div>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-gray-500">{ar.transactionDetail.source}</dt>
            <dd className="font-medium">{transaction.source.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{ar.transactionDetail.date}</dt>
            <dd>
              {new Date(transaction.date).toLocaleDateString('ar-IQ', {
                dateStyle: 'medium',
                numberingSystem: 'latn',
              })}
            </dd>
          </div>
          {transaction.note && (
            <div>
              <dt className="text-gray-500">{ar.transactionDetail.note}</dt>
              <dd>{transaction.note}</dd>
            </div>
          )}
          {transaction.fxEnabled && (
            <div>
              <dt className="text-gray-500">FX</dt>
              <dd>
                {transaction.fxFromCurrency} → {transaction.fxToCurrency}
                {transaction.fxRate != null && ` @ ${transaction.fxRate}`}
                {transaction.fxFromAmount != null && ` (${transaction.fxFromAmount} ${transaction.fxFromCurrency})`}
              </dd>
            </div>
          )}
        </dl>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setEditing(true);
            }
          }}
          className="btn-glass mt-5 w-full min-h-[44px] cursor-pointer select-none relative z-10 touch-manipulation"
          style={{ touchAction: 'manipulation' }}
          aria-label={ar.common.edit}
        >
          {ar.common.edit}
        </div>
      </div>
    </div>
  );
}
