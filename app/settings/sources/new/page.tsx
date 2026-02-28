import { SourceForm } from '@/components/SourceForm';
import { createSource } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { BackLink } from '@/components/BackLink';

export default function NewSourcePage() {
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-below-nav overflow-y-auto animate-page-in">
      <div className="mx-auto max-w-md">
        <header className="flex items-center gap-4 pt-3 pb-5">
          <BackLink href="/settings" label={ar.nav.settings} />
          <h1 className="text-xl font-semibold flex-1 min-w-0 truncate">{ar.settings.newSource}</h1>
        </header>
        <SourceForm action={createSource} />
      </div>
    </main>
  );
}
