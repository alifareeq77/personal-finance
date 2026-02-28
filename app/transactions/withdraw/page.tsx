import { getSources } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { WithdrawForm } from '@/components/WithdrawForm';
import { BackLink } from '@/components/BackLink';

export default async function WithdrawPage() {
  const sources = await getSources();
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6 animate-page-in">
      <div className="mx-auto max-w-md">
        <header className="flex items-center gap-4 pt-3 pb-5">
          <BackLink href="/transactions" label={ar.nav.transactions} />
          <h1 className="text-xl font-semibold flex-1 min-w-0 truncate">{ar.withdraw.title}</h1>
        </header>
        <WithdrawForm sources={sources} />
      </div>
    </main>
  );
}
