import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ar } from '@/lib/ar';
import { SourceForm } from '@/components/SourceForm';
import { updateSource } from '@/lib/actions/sources';
import { BackLink } from '@/components/BackLink';

export default async function EditSourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await prisma.source.findUnique({ where: { id } });
  if (!source) notFound();
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-below-nav overflow-y-auto">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 pt-2 pb-4">
          <BackLink href="/settings" label={ar.nav.settings} />
          <h1 className="text-xl font-semibold">{ar.settings.editSource}</h1>
        </div>
        <SourceForm action={updateSource.bind(null, id)} initial={{ name: source.name, type: source.type ?? '', initialBalanceIqd: source.initialBalanceIqd ?? 0 }} />
      </div>
    </main>
  );
}
