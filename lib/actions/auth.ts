'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  setAuthCookieWithPassword,
  clearAuthCookie,
  getCookiePayloadIgnoreExpiry,
  passwordMatchesStoredCookie,
} from '@/lib/auth';
import { ar } from '@/lib/ar';

const COOKIE_NAME = 'auth';

/** Set password for this device (first time). */
export async function setPasswordAction(formData: FormData): Promise<{ error?: string }> {
  const password = (formData.get('password') as string)?.trim() ?? '';
  const confirm = (formData.get('confirm') as string)?.trim() ?? '';
  if (!password) {
    return { error: ar.auth.passwordRequired };
  }
  if (password.length < 4) {
    return { error: ar.auth.passwordTooShort };
  }
  if (password !== confirm) {
    return { error: ar.auth.passwordMismatch };
  }
  try {
    await setAuthCookieWithPassword(password);
  } catch (err) {
    return { error: process.env.APP_PASSWORD || process.env.COOKIE_SECRET ? 'Failed to set password.' : 'Set APP_PASSWORD or COOKIE_SECRET in .env to enable password protection.' };
  }
  redirect('/');
}

/** Enter password to unlock (device already has a password set). */
export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const password = (formData.get('password') as string)?.trim() ?? '';
  if (!password) {
    return { error: ar.auth.passwordRequired };
  }
  const c = await cookies();
  const cookieValue = c.get(COOKIE_NAME)?.value;
  const payload = getCookiePayloadIgnoreExpiry(cookieValue);
  if (!payload) {
    return { error: ar.auth.setPasswordFirst };
  }
  if (!passwordMatchesStoredCookie(password, payload.h)) {
    return { error: ar.auth.wrongPassword };
  }
  await setAuthCookieWithPassword(password); // refresh expiry
  redirect('/');
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect('/login');
}
