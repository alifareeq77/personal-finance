import { SourceForm } from '@/components/SourceForm';
import { createSource } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { BackLink } from '@/components/BackLink';

export default function NewSourcePage() {
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 pt-2 pb-4">
          <BackLink href="/settings" label={ar.nav.settings} />
          <h1 className="text-xl font-semibold">{ar.settings.newSource}</h1>
        </div>
        <SourceForm action={createSource} />
      </div>
    </main>
  );
}
