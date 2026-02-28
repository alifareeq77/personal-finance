'use client';

import Link from 'next/link';
import { ar } from '@/lib/ar';

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function BackLink({ href, label }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-2 py-2 text-[15px] text-secondary hover:text-secondary/90 active:opacity-80 transition-colors"
      aria-label={label ?? ar.common.back}
    >
      <ChevronLeftIcon className="flex-shrink-0 w-6 h-6" />
      {label && <span className="font-medium">{label}</span>}
    </Link>
  );
}
