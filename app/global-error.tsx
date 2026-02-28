'use client';

import { ar } from '@/lib/ar';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="text-white min-h-dvh flex items-center justify-center p-4 font-sans" style={{ background: '#0f0d1e' }}>
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 max-w-md text-center">
          <h1 className="text-lg font-semibold text-red-400">{ar.errors.somethingWrong}</h1>
          <p className="mt-2 text-gray-400 text-sm">{error.message || ar.errors.serverError}</p>
          <p className="mt-4 text-gray-500 text-xs">
            {ar.errors.ensureEnv}{' '}
            <code className="bg-white/10 px-1 rounded">DATABASE_URL=&quot;file:./prisma/dev.db&quot;</code> {ar.errors.runDbPush}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 min-h-[44px] px-6 btn-glass-accent"
          >
            {ar.errors.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}
