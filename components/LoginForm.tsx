'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ar } from '@/lib/ar';
import { loginAction, setPasswordAction } from '@/lib/actions/auth';

export function LoginForm({ hasDevicePassword }: { hasDevicePassword: boolean }) {
  const [mode, setMode] = useState<'enter' | 'set'>(hasDevicePassword ? 'enter' : 'set');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleEnter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await loginAction(new FormData(e.currentTarget));
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push('/');
    router.refresh();
  }

  async function handleSet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await setPasswordAction(new FormData(e.currentTarget));
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push('/');
    router.refresh();
  }

  const isSet = mode === 'set';

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 pt-[var(--safe-top)]">
      <div className="card-glass border-secondary/30 bg-secondary-dim w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold text-center mb-1">
          {isSet ? ar.auth.setPasswordTitle : ar.auth.login}
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          {isSet ? ar.auth.setPasswordHint : ar.auth.alreadySetHint}
        </p>

        {isSet ? (
          <form onSubmit={handleSet} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-gray-400 text-sm mb-1.5">
                {ar.auth.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={ar.auth.passwordPlaceholder}
                className="input-glass w-full"
                disabled={pending}
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-gray-400 text-sm mb-1.5">
                {ar.auth.confirmPassword}
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder={ar.auth.confirmPlaceholder}
                className="input-glass w-full"
                disabled={pending}
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="btn-glass-accent w-full min-h-[48px] rounded-xl font-medium"
            >
              {pending ? '…' : ar.auth.setPassword}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEnter} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-gray-400 text-sm mb-1.5">
                {ar.auth.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={ar.auth.passwordPlaceholder}
                className="input-glass w-full"
                autoFocus
                disabled={pending}
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="btn-glass-accent w-full min-h-[48px] rounded-xl font-medium"
            >
              {pending ? '…' : ar.auth.login}
            </button>
          </form>
        )}

        <p className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(isSet ? 'enter' : 'set');
              setError(null);
            }}
            className="text-gray-500 text-sm underline"
          >
            {isSet ? ar.auth.switchToEnter : ar.auth.switchToSet}
          </button>
        </p>
      </div>
    </main>
  );
}
