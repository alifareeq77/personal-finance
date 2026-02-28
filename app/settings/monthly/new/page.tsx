import { getSources } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';
import { MonthlyTemplateForm } from '@/components/MonthlyTemplateForm';
import { createMonthlyTemplate } from '@/lib/actions/monthly';
import { BackLink } from '@/components/BackLink';

export default async function NewMonthlyPage() {
  const sources = await getSources();
  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2 pt-2 pb-4">
          <BackLink href="/settings" label={ar.nav.settings} />
          <h1 className="text-xl font-semibold">{ar.settings.newTemplate}</h1>
        </div>
        <MonthlyTemplateForm action={createMonthlyTemplate} sources={sources} />
      </div>
    </main>
  );
}
