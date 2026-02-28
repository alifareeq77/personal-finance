import { getSources } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { DepositForm } from '@/components/DepositForm';
import { BackLink } from '@/components/BackLink';

export default async function DepositPage() {
  const sources = await getSources();
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 pt-2 pb-4">
          <BackLink href="/transactions" label={ar.nav.transactions} />
          <h1 className="text-xl font-semibold">{ar.deposit.title}</h1>
        </div>
        <DepositForm sources={sources} />
      </div>
    </main>
  );
}
