import { formatNum } from '@/lib/currency';
import { ar } from '@/lib/ar';

export function DebtTotals({
  totals,
}: {
  totals: { receivable: number; payable: number; net: number };
}) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-2.5 text-center">
      <div className="card-glass p-4">
        <p className="text-gray-500 text-xs">{ar.debts.onHold}</p>
        <p className="mt-0.5 text-accent font-semibold tabular-nums">{formatNum(totals.receivable)}</p>
      </div>
      <div className="card-glass p-4">
        <p className="text-gray-500 text-xs">{ar.debts.out}</p>
        <p className="mt-0.5 text-red-400 font-semibold tabular-nums">{formatNum(totals.payable)}</p>
      </div>
      <div className="card-glass p-4">
        <p className="text-gray-500 text-xs">{ar.debts.net}</p>
        <p className={`mt-0.5 font-semibold tabular-nums ${totals.net >= 0 ? 'text-accent' : 'text-red-400'}`}>
          {formatNum(totals.net)}
        </p>
      </div>
    </div>
  );
}
