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
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-below-nav overflow-y-auto animate-page-in">
      <div className="mx-auto max-w-md">
        <header className="flex items-center gap-4 pt-3 pb-5">
          <BackLink href="/transactions" label={ar.nav.transactions} />
          <h1 className="text-xl font-semibold flex-1 min-w-0 truncate">{ar.transactionTitle}</h1>
        </header>
        <TransactionDetail transaction={transaction} sources={sources} dateStr={dateStr} />
      </div>
    </main>
  );
}
