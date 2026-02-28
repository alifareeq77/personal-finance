'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { applyMonthlyTemplate } from '@/lib/actions/monthly';
import { ar } from '@/lib/ar';

type Item = {
  id: string;
  name: string;
  amountIqd: number;
  kind: string;
  source: { name: string };
};

type Template = {
  id: string;
  name: string;
  isActive: boolean;
  items: Item[];
};

export function MonthlySection({
  templates,
  monthKey,
  appliedTemplateIds,
}: {
  templates: Template[];
  monthKey: string;
  appliedTemplateIds: string[];
}) {
  const router = useRouter();
  const [confirmTemplateId, setConfirmTemplateId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApply = (templateId: string) => {
    startTransition(async () => {
      const res = await applyMonthlyTemplate(monthKey, templateId);
      if (!res?.error) {
        setConfirmTemplateId(null);
        router.refresh();
      }
    });
  };

  const [y, m] = monthKey.split('-');
  const monthLabel = new Date(Number(y), Number(m) - 1).toLocaleString('ar-IQ', { month: 'long', year: 'numeric', numberingSystem: 'latn' });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-200">{ar.settings.monthlyTemplates}</h2>
        <Link
          href="/settings/monthly/new"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center btn-glass-secondary"
          aria-label={ar.settings.newTemplate}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        {ar.settings.templateDescription}
      </p>
      <ul className="space-y-3 mb-5">
        {templates.map((t) => {
          const applied = appliedTemplateIds.includes(t.id);
          const incomeCount = t.items.filter((i) => i.kind === 'INCOME').length;
          const expenseCount = t.items.filter((i) => i.kind === 'EXPENSE').length;
          const summary = [
            incomeCount ? ar.settings.incomeCount(incomeCount) : null,
            expenseCount ? ar.settings.expenseCount(expenseCount) : null,
          ]
            .filter(Boolean)
            .join(', ');
          return (
            <li key={t.id} className="card-glass rounded-2xl px-4 py-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className={t.isActive ? '' : 'text-gray-500'}>{t.name}</span>
                  <p className="text-gray-500 text-xs mt-0.5">{ar.settings.entriesCount(t.items.length, summary)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/settings/monthly/${t.id}`} className="text-secondary text-sm">
                    {ar.common.edit}
                  </Link>
                  {applied ? (
                    <span className="text-gray-500 text-sm">{ar.debts.applied}</span>
                  ) : t.isActive && t.items.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setConfirmTemplateId(t.id)}
                      className="min-h-[36px] px-3 rounded-xl bg-secondary-dim border border-secondary/30 text-secondary text-sm font-medium active:bg-secondary/20 transition-colors"
                    >
                      {ar.common.apply}
                    </button>
                  ) : null}
                </div>
              </div>
              {confirmTemplateId === t.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setConfirmTemplateId(null)}
                    aria-hidden
                  />
                  <div className="card-glass relative w-full max-w-sm p-6">
                    <p className="text-center mb-5">
                      {ar.settings.applyConfirm(t.items.length, t.name, monthLabel)}
</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmTemplateId(null)}
                        className="flex-1 btn-glass min-h-[44px]"
                      >
                        {ar.common.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply(t.id)}
                        disabled={isPending}
                        className="flex-1 min-h-[44px] btn-glass-accent disabled:opacity-50"
                      >
                        {isPending ? ar.settings.applying : ar.common.confirm}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {templates.length === 0 && (
        <p className="text-gray-500 text-sm">{ar.settings.noTemplatesYet}</p>
      )}
    </section>
  );
}
