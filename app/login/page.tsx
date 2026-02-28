import { cookies } from 'next/headers';
import { getCookiePayloadIgnoreExpiry } from '@/lib/auth';
import { COOKIE_NAME } from '@/lib/auth';
import { LoginForm } from '@/components/LoginForm';

export default async function LoginPage() {
  const c = await cookies();
  const cookieValue = c.get(COOKIE_NAME)?.value;
  const payload = getCookiePayloadIgnoreExpiry(cookieValue);
  const hasDevicePassword = !!payload;

  return <LoginForm hasDevicePassword={hasDevicePassword} />;
}
