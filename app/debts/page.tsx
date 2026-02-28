import { getSources } from '@/lib/actions/sources';
import { getDebts, getDebtTotals } from '@/lib/actions/debts';
import { ar } from '@/lib/ar';
import { DebtTotals } from '@/components/DebtTotals';
import { DebtList } from '@/components/DebtList';
import { AddDebtForm } from '@/components/AddDebtForm';

export const dynamic = 'force-dynamic';

export default async function DebtsPage() {
  const [sources, debts, totals] = await Promise.all([
    getSources(),
    getDebts(),
    getDebtTotals(),
  ]);
  return (
    <main className="flex-1 min-h-0 overflow-y-auto flex flex-col px-4 pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 1.5rem)' }}>
      <div className="mx-auto w-full max-w-lg">
        <h1 className="text-xl font-semibold pt-2 pb-4">{ar.debts.title}</h1>
        <DebtTotals totals={totals} />
        <AddDebtForm sources={sources} />
        <DebtList debts={debts} />
      </div>
    </main>
  );
}
