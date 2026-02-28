import { getSources } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { MonthlyTemplateForm } from '@/components/MonthlyTemplateForm';
import { createMonthlyTemplate } from '@/lib/actions/monthly';
import { BackLink } from '@/components/BackLink';

export default async function NewMonthlyPage() {
  const sources = await getSources();
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-below-nav overflow-y-auto animate-page-in">
      <div className="mx-auto max-w-md">
        <header className="flex items-center gap-4 pt-3 pb-5">
          <BackLink href="/settings" label={ar.nav.settings} />
          <h1 className="text-xl font-semibold flex-1 min-w-0 truncate">{ar.settings.newTemplate}</h1>
        </header>
        <MonthlyTemplateForm action={createMonthlyTemplate} sources={sources} />
      </div>
    </main>
  );
}
