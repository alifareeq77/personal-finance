import { getSources } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { WithdrawForm } from '@/components/WithdrawForm';
import { BackLink } from '@/components/BackLink';

export default async function WithdrawPage() {
  const sources = await getSources();
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 pt-2 pb-4">
          <BackLink href="/transactions" label={ar.nav.transactions} />
          <h1 className="text-xl font-semibold">{ar.withdraw.title}</h1>
        </div>
        <WithdrawForm sources={sources} />
      </div>
    </main>
  );
}
