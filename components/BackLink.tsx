'use client';

import Link from 'next/link';
import { ar } from '@/lib/ar';

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function BackLink({ href, label }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-[44px] min-w-[44px] -ml-2 items-center justify-center gap-0.5 rounded-xl pr-1 text-[17px] text-secondary active:opacity-70"
      aria-label={label ?? ar.common.back}
    >
      <ChevronLeftIcon className="flex-shrink-0" />
      {label && <span className="font-normal">{label}</span>}
    </Link>
  );
}
