'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateTransaction } from '@/lib/actions/transactions';
import { formatNum } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { CurrencyInput } from '@/components/CurrencyInput';

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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (editing) setAmount(String(transaction.amountIqd));
  }, [editing, transaction.amountIqd]);

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
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="card-glass space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.type}</label>
            <select
              name="kind"
              defaultValue={transaction.kind}
              className="input-glass w-full"
            >
              {Object.entries(KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.amount}</label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              name="amountIqd"
              required
              placeholder={ar.amountPlaceholder}
              className="input-glass w-full no-number-spinner"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.source}</label>
            <select
              name="sourceId"
              defaultValue={transaction.sourceId}
              required
              className="input-glass w-full"
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.date}</label>
            <input
              type="date"
              name="date"
              defaultValue={dateStr}
              required
              className="input-glass w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-gray-500 text-sm">{ar.transactionDetail.note}</label>
            <input
              type="text"
              name="note"
              defaultValue={transaction.note ?? ''}
              placeholder={ar.transactionDetail.notePlaceholder}
              className="input-glass w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-glass flex-1 min-h-[44px]"
            >
              {ar.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 min-h-[44px] btn-glass-accent disabled:opacity-50"
            >
              {isPending ? ar.transactionDetail.saving : ar.transactionDetail.save}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const isOut = transaction.kind === 'EXPENSE' || transaction.kind === 'WITHDRAW';
  const amountDisplay = `${isOut ? '-' : ''}${formatNum(transaction.amountIqd)} د.ع`;

  return (
    <div className="space-y-4">
      <div className="card-glass p-5">
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
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-glass mt-5 w-full min-h-[44px]"
        >
          {ar.common.edit}
        </button>
      </div>
    </div>
  );
}
