import { formatNum } from '@/lib/currency';
import { ar } from '@/lib/ar';

export function DebtTotals({
  totals,
}: {
  totals: { receivable: number; payable: number; net: number };
}) {
  const receivable = Number(totals.receivable) || 0;
  const payable = Number(totals.payable) || 0;
  const net = receivable - payable;
  return (
    <div className="mb-5 grid grid-cols-3 gap-2.5 text-center">
      <div className="card-glass p-4">
        <p className="text-gray-500 text-xs">{ar.debts.theyOweMeShort}</p>
        <p className="mt-0.5 text-accent font-semibold tabular-nums">{formatNum(receivable)}</p>
      </div>
      <div className="card-glass p-4">
        <p className="text-gray-500 text-xs">{ar.debts.iOweShort}</p>
        <p className="mt-0.5 text-red-400 font-semibold tabular-nums">{formatNum(payable)}</p>
      </div>
      <div className="card-glass p-4">
        <p className="text-gray-500 text-xs">{ar.debts.net}</p>
        <p className={`mt-0.5 font-semibold tabular-nums ${net >= 0 ? 'text-accent' : 'text-red-400'}`}>
          {formatNum(net)}
        </p>
      </div>
    </div>
  );
}
