'use client';

import { useEffect } from 'react';
import { ar } from '@/lib/ar';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh px-4 pt-[var(--safe-top)] pb-6 flex flex-col items-center justify-center">
      <div className="card-glass max-w-md p-6 text-center">
        <h1 className="text-lg font-semibold text-red-400">{ar.errors.somethingWrong}</h1>
        <p className="mt-2 text-gray-400 text-sm">
          {error.message || ar.errors.serverError}
        </p>
        <p className="mt-4 text-gray-500 text-xs">
          {ar.errors.ifJustSetup} <code className="bg-white/10 px-1 rounded">npx prisma db push</code>
        </p>
        <p className="mt-2 text-gray-500 text-xs">
          {ar.errors.vercelHint}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-[44px] px-6 btn-glass-accent"
        >
          {ar.errors.tryAgain}
        </button>
      </div>
    </main>
  );
}
