import { notFound } from 'next/navigation';
import { getTransaction } from '@/lib/actions/transactions';
import { getSources } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { BackLink } from '@/components/BackLink';
import { TransactionDetail } from '@/components/TransactionDetail';

export const dynamic = 'force-dynamic';

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [transaction, sources] = await Promise.all([
    getTransaction(id),
    getSources(),
  ]);
  if (!transaction) notFound();
  const dateStr = transaction.date.toISOString().slice(0, 10);
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 1.5rem)' }}>
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 pt-2 pb-4">
          <BackLink href="/transactions" label={ar.nav.transactions} />
          <h1 className="text-xl font-semibold">{ar.transactionTitle}</h1>
        </div>
        <TransactionDetail transaction={transaction} sources={sources} dateStr={dateStr} />
      </div>
    </main>
  );
}
