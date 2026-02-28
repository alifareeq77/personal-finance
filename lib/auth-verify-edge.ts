/**
 * Verify auth token in Edge (middleware). Uses Web Crypto.
 * Cookie payload: { h, e, sig } where sig = sha256(secret + h + e).
 */
const COOKIE_NAME = 'auth';

async function sha256HexEdge(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function createSignatureEdge(secret: string, h: string, e: number): Promise<string> {
  return sha256HexEdge(secret + h + String(e));
}

export async function verifyAuthToken(cookieValue: string | undefined): Promise<boolean> {
  const secret = process.env.APP_PASSWORD || process.env.COOKIE_SECRET;
  if (!secret || !cookieValue) return false;
  try {
    const base64 = cookieValue.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const raw = new TextDecoder().decode(new Uint8Array(binary.split('').map((c) => c.charCodeAt(0))));
    const { h, e, sig } = JSON.parse(raw) as { h: string; e: number; sig: string };
    if (typeof h !== 'string' || typeof e !== 'number' || typeof sig !== 'string') return false;
    if (e < Date.now()) return false;
    const expectedSig = await createSignatureEdge(secret, h, e);
    return expectedSig === sig;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
