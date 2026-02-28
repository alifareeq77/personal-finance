import Link from 'next/link';
import { getTransactionsForMonth, getMonthSummary } from '@/lib/actions/transactions';
import { formatNum } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { MonthPicker } from '@/components/MonthPicker';

function kindLabel(kind: string) {
  const map: Record<string, string> = {
    EXPENSE: ar.transactions.expense,
    INCOME: ar.transactions.income,
    DEPOSIT: ar.transactions.depositKind,
    WITHDRAW: ar.transactions.withdrawKind,
    TRANSFER: ar.transactions.transfer,
  };
  return map[kind] ?? kind;
}

function kindColor(kind: string) {
  if (kind === 'INCOME' || kind === 'DEPOSIT') return 'text-accent';
  if (kind === 'EXPENSE' || kind === 'WITHDRAW') return 'text-red-400';
  return 'text-gray-300';
}

function parseMonthParam(monthParam: string | null) {
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;
  if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
    return { year: defaultYear, month: defaultMonth };
  }
  const [y, m] = monthParam.split('-').map(Number);
  if (m < 1 || m > 12) return { year: defaultYear, month: defaultMonth };
  return { year: y, month: m };
}

export const dynamic = 'force-dynamic';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam ?? null);

  const [transactions, summary] = await Promise.all([
    getTransactionsForMonth(year, month),
    getMonthSummary(year, month),
  ]);

  const monthLabel = new Date(year, month - 1).toLocaleString('ar-IQ', { month: 'long', year: 'numeric', numberingSystem: 'latn' });
  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold pt-2 pb-4">{ar.transactions.title}</h1>
        <div className="card-glass mb-4 p-4">
          <MonthPicker />
        </div>
        <div className="card-glass mb-5 p-4 text-sm">
          <p className="text-gray-500">{isCurrentMonth ? ar.transactions.thisMonthSoFar : monthLabel}</p>
          <p className="mt-1">
            {ar.transactions.in} <span className="text-accent">{formatNum(summary.inTotal)}</span>
            {' · '}
            {ar.transactions.out} <span className="text-red-400">{formatNum(summary.outTotal)}</span>
            {' · '}
            {ar.transactions.net} <span className={summary.net >= 0 ? 'text-accent' : 'text-red-400'}>{formatNum(summary.net)}</span>
          </p>
        </div>
        <div className="flex gap-2.5 mb-5">
          <Link
            href="/transactions/deposit"
            className="flex-1 min-h-[44px] rounded-2xl bg-accent-dim backdrop-blur-md border border-accent/20 flex items-center justify-center text-sm font-medium text-accent active:bg-accent/30 transition-colors"
          >
            {ar.transactions.deposit}
          </Link>
          <Link
            href="/transactions/withdraw"
            className="flex-1 min-h-[44px] rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-400/20 flex items-center justify-center text-sm font-medium text-red-400 active:bg-red-500/30 transition-colors"
          >
            {ar.transactions.withdraw}
          </Link>
        </div>
        <ul className="space-y-2">
          {transactions.map((t) => (
            <li key={t.id}>
              <Link
                href={`/transactions/${t.id}`}
                className="card-glass flex items-center justify-between px-4 py-3.5 active:opacity-90 block"
              >
                <div>
                  <span className={kindColor(t.kind)}>{kindLabel(t.kind)}</span>
                  <span className="text-gray-500 ms-2">{t.source.name}</span>
                </div>
                <span className={`tabular-nums ${kindColor(t.kind)}`}>
                  {t.kind === 'EXPENSE' || t.kind === 'WITHDRAW' ? '-' : ''}
                  {formatNum(t.amountIqd)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {transactions.length === 0 && (
          <p className="text-gray-500 text-center py-10">{ar.transactions.noTransactions}</p>
        )}
      </div>
    </main>
  );
}
