'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { settleDebt } from '@/lib/actions/debts';
import { formatNum } from '@/lib/currency';
import { ar } from '@/lib/ar';

type Debt = {
  id: string;
  direction: string;
  personName: string;
  amountIqd: number;
  status: string;
  date: Date;
  sourceId: string | null;
  source: { id: string; name: string } | null;
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function DebtList({ debts }: { debts: Debt[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const openDebts = debts.filter((d) => d.status === 'OPEN');
  const settled = debts.filter((d) => d.status === 'SETTLED');

  const handleSettle = (id: string) => {
    startTransition(async () => {
      const res = await settleDebt(id);
      if (!res?.error) router.refresh();
    });
  };

  return (
    <div className="space-y-4 pb-2">
      {openDebts.length > 0 && (
        <ul className="space-y-2">
          {openDebts.map((d, i) => (
            <li key={d.id} className="card-glass flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl animate-list-in" style={{ animationDelay: `${i * 45}ms` }}>
              <div className="min-w-0 flex-1">
                <p className="text-gray-400 text-sm truncate">{d.personName}</p>
                <p className={`text-sm font-semibold tabular-nums ${d.direction === 'RECEIVABLE' ? 'text-accent' : 'text-red-400'}`}>
                  {d.direction === 'RECEIVABLE' ? ar.debts.theyOweMeShort : ar.debts.iOweShort} · {formatNum(d.amountIqd)} د.ع
                </p>
                {d.source && (
                  <p className="text-gray-500 text-xs mt-0.5">→ {d.source.name}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleSettle(d.id)}
                disabled={isPending}
                className="shrink-0 flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-sm font-medium text-accent bg-accent-dim hover:bg-accent/20 active:bg-accent/30 transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_0_1px_rgba(34,197,94,0.2)]"
              >
                <CheckIcon />
                <span>{ar.debts.settle}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {settled.length > 0 && (
        <div>
          <p className="text-gray-500 text-sm mb-2">{ar.debts.settled}</p>
          <ul className="space-y-2">
            {settled.map((d) => (
              <li
                key={d.id}
                className="card-glass flex items-center justify-between px-4 py-2.5 text-gray-500 text-sm opacity-80"
              >
                <span>{d.personName}</span>
                <span className="tabular-nums line-through">{formatNum(d.amountIqd)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {debts.length === 0 && (
        <p className="text-gray-500 text-center py-10">{ar.debts.noDebts}</p>
      )}
    </div>
  );
}
