'use client';

import { useState } from 'react';
import Link from 'next/link';
import { archiveSource, unarchiveSource } from '@/lib/actions/sources';
import { ar } from '@/lib/ar';

type Source = { id: string; name: string; type: string | null; isArchived: boolean };

const iconClass = 'flex shrink-0';
const iconSize = 18;

function PenIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden>
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function SourcesSection({ sources }: { sources: Source[] }) {
  const [archiving, setArchiving] = useState<string | null>(null);
  const active = sources.filter((s) => !s.isArchived);
  const archived = sources.filter((s) => s.isArchived);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-200">{ar.settings.sources}</h2>
        <Link
          href="/settings/sources/new"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center btn-glass-accent"
          aria-label={ar.common.add}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>
      <ul className="space-y-2">
        {active.map((s) => (
          <li key={s.id} className="card-glass flex items-center justify-between px-4 py-3.5">
            <span>{s.name}</span>
            <div className="flex items-center gap-2">
              <Link
                href={`/settings/sources/${s.id}`}
                className="btn-glass flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl text-sm"
                aria-label={ar.common.edit}
              >
                <PenIcon />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setArchiving(s.id);
                  archiveSource(s.id).then(() => setArchiving(null));
                }}
                disabled={!!archiving}
                className="btn-glass flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl text-sm disabled:opacity-50"
                aria-label={ar.settings.archive}
              >
                <ArchiveIcon />
              </button>
            </div>
          </li>
        ))}
        {archived.map((s) => (
          <li key={s.id} className="card-glass flex items-center justify-between px-4 py-2.5 text-gray-500 opacity-80">
            <span>{s.name} ({ar.settings.archived})</span>
            <button
              type="button"
              onClick={() => unarchiveSource(s.id)}
              className="btn-glass flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl text-sm"
              aria-label={ar.settings.restore}
            >
              <RestoreIcon />
            </button>
          </li>
        ))}
      </ul>
      {sources.length === 0 && (
        <p className="text-gray-500 text-sm">{ar.settings.noSourcesHint}</p>
      )}
    </section>
  );
}
