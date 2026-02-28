import { getSources } from '@/lib/actions/sources';
import { QuickAddForm } from '@/components/QuickAddForm';
import { ar } from '@/lib/ar';

export default async function HomePage() {
  const sources = await getSources();
  return (
    <main className="flex-1 min-h-0 overflow-y-auto flex flex-col px-4 pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 1.5rem)' }}>
      <div className="mx-auto w-full max-w-[390px]">
        <h1 className="sr-only">{ar.home.title}</h1>
        <QuickAddForm sources={sources} />
      </div>
    </main>
  );
}
