'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatNum } from '@/lib/currency';

type Source = { id: string; name: string };

export function SourcePicker({
  sources,
  value,
  onChange,
  selectedBalance,
  className = '',
}: {
  sources: Source[];
  value: string | null;
  onChange: (id: string | null) => void;
  selectedBalance?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = sources.find((s) => s.id === value) ?? sources[0];
  const displayName = selected?.name ?? '';

  useLayoutEffect(() => {
    if (!open) {
      setDropdownRect(null);
      return;
    }
    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inTrigger = containerRef.current?.contains(target);
      const inDropdown = target.closest('[data-source-dropdown]');
      if (!inTrigger && !inDropdown) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const dropdownContent = open && dropdownRect && typeof document !== 'undefined' && (
    <ul
      data-source-dropdown
      className="fixed z-[9999] max-h-[min(280px,60vh)] list-none overflow-y-auto overflow-x-hidden rounded-xl border border-white/[0.08] bg-primary-muted p-0 shadow-xl"
      role="listbox"
      style={{
        top: dropdownRect.top,
        left: dropdownRect.left,
        width: dropdownRect.width,
        WebkitBackdropFilter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {sources.map((s) => (
        <li key={s.id} role="option" aria-selected={value === s.id} className="block border-b border-white/[0.06] last:border-b-0">
          <button
            type="button"
            onClick={() => {
              onChange(s.id);
              setOpen(false);
            }}
            className="block w-full min-h-[44px] px-4 py-2.5 text-left text-base text-white transition-colors active:bg-white/10 disabled:opacity-50"
          >
            {s.name}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="select-trigger-inset w-full text-left flex items-center min-h-[44px] pr-10 pl-4"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Source"
        >
          <span className="flex items-center justify-between w-full gap-2 min-w-0">
            <span className="text-left truncate min-w-0">{displayName}</span>
            {selectedBalance !== undefined && (
              <span
                className={`text-sm tabular-nums shrink-0 ${selectedBalance < 0 ? 'text-red-400' : 'text-gray-400'}`}
                aria-hidden
              >
                {formatNum(selectedBalance)} د.ع
              </span>
            )}
          </span>
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200"
            style={{ transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)' }}
            aria-hidden
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#e5e7eb" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>
      {typeof document !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}
