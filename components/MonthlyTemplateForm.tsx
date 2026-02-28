'use client';

import { useState, useTransition, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { roundToIqdStep } from '@/lib/currency';
import { ar } from '@/lib/ar';
import { SourcePicker } from '@/components/SourcePicker';
import type { TemplateItemInput } from '@/lib/actions/monthly';

type Action = (formData: FormData) => Promise<{ error?: string }>;
type Source = { id: string; name: string };

const emptyItem = (): TemplateItemInput => ({
  name: '',
  amountIqd: 0,
  sourceId: '',
  kind: 'EXPENSE',
});

export function MonthlyTemplateForm({
  action,
  sources,
  initial,
}: {
  action: Action;
  sources: Source[];
  initial?: {
    name: string;
    isActive: boolean;
    items: TemplateItemInput[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [templateName, setTemplateName] = useState(initial?.name ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [items, setItems] = useState<TemplateItemInput[]>(
    initial?.items?.length ? initial.items.map((i) => ({ ...i, amountIqd: Number(i.amountIqd) || 0 })) : [{ ...emptyItem(), sourceId: sources[0]?.id ?? '' }]
  );
  const [openKindIndex, setOpenKindIndex] = useState<number | null>(null);
  const kindTriggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const kindDropdownRef = useRef<HTMLUListElement | null>(null);
  const [kindDropdownRect, setKindDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (openKindIndex === null) {
      setKindDropdownRect(null);
      return;
    }
    const trigger = kindTriggerRefs.current[openKindIndex];
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setKindDropdownRect({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [openKindIndex]);

  useEffect(() => {
    if (openKindIndex === null) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inTrigger = kindTriggerRefs.current[openKindIndex]?.contains(target);
      const inDropdown = kindDropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) setOpenKindIndex(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [openKindIndex]);

  const addEntry = (kind: 'INCOME' | 'EXPENSE') => {
    setItems((prev) => [...prev, { ...emptyItem(), kind, sourceId: sources[0]?.id ?? '' }]);
  };

  const updateItem = (index: number, patch: Partial<TemplateItemInput>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = items
      .map((it) => ({
        ...it,
        name: it.name?.trim() ?? '',
        amountIqd: roundToIqdStep(it.amountIqd || 0),
        sourceId: it.sourceId || sources[0]?.id,
      }))
      .filter((it) => it.name && it.amountIqd > 0 && it.sourceId);
    if (valid.length === 0) return;
    const formData = new FormData();
    formData.set('name', templateName.trim());
    formData.set('items', JSON.stringify(valid));
    if (initial !== undefined) {
      formData.set('isActive', isActive ? 'true' : 'false');
    }
    startTransition(async () => {
      const res = await action(formData);
      if (!res?.error) router.push('/settings');
    });
  };

  if (sources.length === 0) {
    return (
      <div className="card-glass border-secondary/30 bg-secondary-dim p-5 space-y-4">
        <p className="text-secondary text-sm">{ar.settings.addSourceFirst}</p>
        <Link
          href="/settings/sources/new"
          className="btn-glass-accent flex min-h-[48px] items-center justify-center gap-2 rounded-xl text-sm font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          {ar.settings.newSource}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.settings.templateName}</label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          required
          placeholder={ar.settings.templateNamePlaceholder}
          className="input-glass"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-gray-500 text-sm">{ar.settings.entriesLabel}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addEntry('INCOME')}
              className="min-h-[36px] px-3 rounded-xl text-sm font-medium text-accent bg-accent-dim border border-accent/25"
            >
              + {ar.settings.income}
            </button>
            <button
              type="button"
              onClick={() => addEntry('EXPENSE')}
              className="min-h-[36px] px-3 rounded-xl text-sm font-medium text-red-400 bg-red-500/15 border border-red-400/20"
            >
              + {ar.settings.expense}
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((it, index) => (
            <div key={index} className="card-glass rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="relative">
                  <button
                    ref={(el) => {
                      kindTriggerRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => setOpenKindIndex((i) => (i === index ? null : index))}
                    className="select-trigger-inset w-auto min-w-[100px] text-left flex items-center min-h-[44px] pr-10 pl-4"
                    aria-haspopup="listbox"
                    aria-expanded={openKindIndex === index}
                    aria-label={ar.settings.entriesLabel}
                  >
                    <span>{it.kind === 'INCOME' ? ar.settings.income : ar.settings.expense}</span>
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200"
                      style={{
                        transform: openKindIndex === index ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
                      }}
                      aria-hidden
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#e5e7eb" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {openKindIndex === index &&
                    kindDropdownRect &&
                    typeof document !== 'undefined' &&
                    createPortal(
                      <ul
                        ref={kindDropdownRef}
                        data-kind-dropdown
                        role="listbox"
                        className="fixed z-[9999] max-h-[min(280px,60vh)] list-none overflow-y-auto overflow-x-hidden rounded-xl border border-white/[0.08] bg-primary-muted p-0 shadow-xl"
                        style={{
                          top: kindDropdownRect.top,
                          left: kindDropdownRect.left,
                          width: kindDropdownRect.width,
                          WebkitBackdropFilter: 'blur(20px)',
                          backdropFilter: 'blur(20px)',
                        }}
                      >
                        {(['INCOME', 'EXPENSE'] as const).map((k) => (
                          <li key={k} role="option" aria-selected={it.kind === k} className="block border-b border-white/[0.06] last:border-b-0">
                            <button
                              type="button"
                              onClick={() => {
                                updateItem(index, { kind: k });
                                setOpenKindIndex(null);
                              }}
                              className="block w-full min-h-[44px] px-4 py-2.5 text-left text-base text-white transition-colors active:bg-white/10"
                            >
                              {k === 'INCOME' ? ar.settings.income : ar.settings.expense}
                            </button>
                          </li>
                        ))}
                      </ul>,
                      document.body
                    )}
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-gray-500 hover:text-red-400 text-sm"
                  >
                    {ar.common.delete}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={it.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                placeholder={ar.settings.descriptionPlaceholder}
                className="input-glass"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={250}
                  step={250}
                  value={it.amountIqd || ''}
                  onChange={(e) => updateItem(index, { amountIqd: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                  placeholder={ar.settings.amountPlaceholder}
                  className="input-glass no-number-spinner"
                />
                <div className="card-glass rounded-xl overflow-hidden">
                  <SourcePicker
                    sources={sources}
                    value={(it.sourceId || sources[0]?.id) ?? null}
                    onChange={(id) => updateItem(index, { sourceId: id ?? '' })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {initial !== undefined && (
        <label className="flex items-center justify-between gap-3 cursor-pointer group">
          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            {ar.settings.active}
          </span>
          <span
            role="switch"
            aria-checked={isActive}
            tabIndex={0}
            data-state={isActive ? 'on' : 'off'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActive((v) => !v);
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsActive((v) => !v);
              }
            }}
            className="toggle-switch"
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only"
              aria-hidden
              tabIndex={-1}
            />
            <span className="toggle-switch-thumb" aria-hidden />
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          !templateName.trim() ||
          !items.some(
            (i) =>
              (i.name?.trim() ?? '') !== '' &&
              (Number(i.amountIqd) || 0) > 0 &&
              (i.sourceId || sources[0]?.id)
          )
        }
        className="w-full min-h-[48px] btn-glass-accent disabled:opacity-40"
      >
        {ar.monthlyForm.save}
      </button>
    </form>
  );
}
