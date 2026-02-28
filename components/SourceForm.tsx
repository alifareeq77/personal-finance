'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ar } from '@/lib/ar';

type Action = (formData: FormData) => Promise<{ error?: string }>;

export function SourceForm({
  action,
  initial = { name: '', type: '', initialBalanceIqd: 0 },
}: {
  action: Action;
  initial?: { name: string; type: string; initialBalanceIqd?: number };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await action(formData);
      if (!res.error) router.push('/settings');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.settings.sourceName}</label>
        <input
          type="text"
          name="name"
          defaultValue={initial.name}
          required
          placeholder={ar.settings.sourceNamePlaceholder}
          className="input-glass"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">{ar.settings.initialBalance}</label>
        <input
          type="number"
          name="initialBalanceIqd"
          inputMode="numeric"
          min={0}
          step={250}
          defaultValue={initial.initialBalanceIqd ?? 0}
          placeholder={ar.settings.initialBalancePlaceholder}
          className="input-glass no-number-spinner"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-gray-500 text-sm">النوع (اختياري)</label>
        <input
          type="text"
          name="type"
          defaultValue={initial.type}
          placeholder="مثل: بنك، نقد"
          className="input-glass"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full min-h-[48px] btn-glass-accent disabled:opacity-40"
      >
        {ar.sourceForm.save}
      </button>
    </form>
  );
}
