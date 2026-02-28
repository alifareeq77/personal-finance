import { getSources } from '@/lib/actions/sources';
import { getMonthlyTemplates, getApplyLog } from '@/lib/actions/monthly';
import { ar } from '@/lib/ar';
import { SourcesSection } from '@/components/SourcesSection';
import { MonthlySection } from '@/components/MonthlySection';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [sources, templates] = await Promise.all([
    getSources(true),
    getMonthlyTemplates(),
  ]);
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { appliedTemplateIds = [] } = await getApplyLog(monthKey);

  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold pt-2 pb-4">{ar.settings.title}</h1>
        <SourcesSection sources={sources} />
        <MonthlySection templates={templates} monthKey={monthKey} appliedTemplateIds={appliedTemplateIds} />
      </div>
    </main>
  );
}
