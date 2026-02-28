import { getSources } from '@/lib/actions/sources';
import { getDebts, getDebtTotals } from '@/lib/actions/debts';
import { ar } from '@/lib/ar';
import { DebtTotals } from '@/components/DebtTotals';
import { DebtList } from '@/components/DebtList';
import { AddDebtModal } from '@/components/AddDebtModal';

export const dynamic = 'force-dynamic';

export default async function DebtsPage() {
  const [sources, debts, totals] = await Promise.all([
    getSources(),
    getDebts(),
    getDebtTotals(),
  ]);
  return (
    <main className="flex-1 min-h-0 flex flex-col px-4 pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 1.5rem)' }}>
      <div className="mx-auto w-full max-w-lg flex flex-col min-h-0 flex-1">
        <h1 className="text-xl font-semibold pt-2 pb-4 shrink-0">{ar.debts.title}</h1>
        <div className="shrink-0">
          <DebtTotals totals={totals} />
        </div>
        <div className="shrink-0 mb-4">
          <AddDebtModal sources={sources} />
        </div>
        <div className="scroll-list flex-1 min-h-0 -mx-1 px-1">
          <DebtList debts={debts} />
        </div>
      </div>
    </main>
  );
}
