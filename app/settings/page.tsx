import { getSources, getSourceBalances } from '@/lib/actions/sources';
import { getMonthlyTemplates, getApplyLog } from '@/lib/actions/monthly';
import { logoutAction } from '@/lib/actions/auth';
import { ar } from '@/lib/ar';
import { SourcesSection } from '@/components/SourcesSection';
import { MonthlySection } from '@/components/MonthlySection';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [sources, templates, sourceBalances] = await Promise.all([
    getSources(true),
    getMonthlyTemplates(),
    getSourceBalances(true),
  ]);
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { appliedTemplateIds = [] } = await getApplyLog(monthKey);

  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-below-nav overflow-y-auto scroll-list">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold pt-2 pb-4">{ar.settings.title}</h1>
        <SourcesSection sources={sources} sourceBalances={sourceBalances} />
        <MonthlySection templates={templates} monthKey={monthKey} appliedTemplateIds={appliedTemplateIds} />
        <form action={logoutAction} className="mt-8">
          <button type="submit" className="btn-glass w-full min-h-[48px] rounded-xl text-gray-400 text-sm">
            {ar.auth.logout}
          </button>
        </form>
      </div>
    </main>
  );
}
