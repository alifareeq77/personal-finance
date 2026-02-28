import { cookies } from 'next/headers';

const COOKIE_NAME = 'auth';
const MAX_AGE_DAYS = 365; // long-lived: set once per device

function getSigningSecret(): string {
  const s = process.env.APP_PASSWORD || process.env.COOKIE_SECRET;
  if (!s) throw new Error('APP_PASSWORD or COOKIE_SECRET is required for auth');
  return s;
}

/** SHA-256 hash to hex (Node) */
function sha256HexNode(data: string): string {
  const { createHash } = require('crypto');
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

type Payload = { h: string; e: number; sig: string };

function createSignature(secret: string, h: string, e: number): string {
  return sha256HexNode(secret + h + String(e));
}

/** Create signed token from user's password hash (set once per device) */
export function createAuthTokenFromPassword(password: string): string {
  const secret = getSigningSecret();
  const h = sha256HexNode(password);
  const e = Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const sig = createSignature(secret, h, e);
  const payload: Payload = { h, e, sig };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/** Set auth cookie with the user's chosen password (call after "set password" or successful "enter password") */
export async function setAuthCookieWithPassword(password: string): Promise<void> {
  const token = createAuthTokenFromPassword(password);
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

/** Clear auth cookie (logout) */
export async function clearAuthCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

/** Decode and verify cookie payload (signature + expiry). Returns payload if valid. */
export function verifyAndDecodeCookie(cookieValue: string | undefined): Payload | null {
  const secret = process.env.APP_PASSWORD || process.env.COOKIE_SECRET;
  if (!secret || !cookieValue) return null;
  try {
    const base64 = cookieValue.replace(/-/g, '+').replace(/_/g, '/');
    const binary = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(binary) as Payload;
    if (typeof payload.h !== 'string' || typeof payload.e !== 'number' || typeof payload.sig !== 'string')
      return null;
    const expectedSig = createSignature(secret, payload.h, payload.e);
    if (expectedSig !== payload.sig) return null;
    if (payload.e < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

/** Check if entered password matches stored hash (for login). Returns true if match. */
export function passwordMatchesStoredCookie(enteredPassword: string, storedHash: string): boolean {
  const h = sha256HexNode(enteredPassword);
  return h === storedHash;
}

/** Get payload from cookie without expiry check (to detect "device has set password" for UI). */
export function getCookiePayloadIgnoreExpiry(cookieValue: string | undefined): Payload | null {
  const secret = process.env.APP_PASSWORD || process.env.COOKIE_SECRET;
  if (!secret || !cookieValue) return null;
  try {
    const base64 = cookieValue.replace(/-/g, '+').replace(/_/g, '/');
    const binary = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(binary) as Payload;
    if (typeof payload.h !== 'string' || typeof payload.e !== 'number' || typeof payload.sig !== 'string')
      return null;
    const expectedSig = createSignature(secret, payload.h, payload.e);
    if (expectedSig !== payload.sig) return null;
    return payload; // don't check expiry
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
