import { notFound } from 'next/navigation';
import { getSources } from '@/lib/actions/sources';
import { prisma } from '@/lib/db';
import { ar } from '@/lib/ar';
import { MonthlyTemplateForm } from '@/components/MonthlyTemplateForm';
import { updateMonthlyTemplate } from '@/lib/actions/monthly';
import { BackLink } from '@/components/BackLink';

export default async function EditMonthlyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [template, sources] = await Promise.all([
    prisma.monthlyTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    }),
    getSources(),
  ]);
  if (!template) notFound();
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 pt-2 pb-4">
          <BackLink href="/settings" label={ar.nav.settings} />
          <h1 className="text-xl font-semibold">{ar.settings.editTemplate}</h1>
        </div>
        <MonthlyTemplateForm
          action={updateMonthlyTemplate.bind(null, id)}
          sources={sources}
          initial={{
            name: template.name,
            isActive: template.isActive,
            items: template.items.map((i) => ({
              name: i.name,
              amountIqd: i.amountIqd,
              sourceId: i.sourceId,
              kind: i.kind as 'INCOME' | 'EXPENSE',
            })),
          }}
        />
      </div>
    </main>
  );
}
