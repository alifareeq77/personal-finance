import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { Archivo, Tajawal } from 'next/font/google';
import './globals.css';

const SwipeablePages = dynamic(() => import('@/components/SwipeablePages'), { ssr: true });
const BottomNav = dynamic(() => import('@/components/BottomNav').then((m) => ({ default: m.BottomNav })), { ssr: true });

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const tajawal = Tajawal({
  weight: ['400', '500', '700'],
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'المالية',
  description: 'تتبع المالية الشخصية',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'المالية' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f0d1e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${archivo.variable} ${tajawal.variable} text-white`} style={{ background: 'var(--color-primary)' }}>
      <body className="font-sans antialiased h-dvh overflow-hidden flex flex-col bg-gradient-to-b from-primary-soft via-primary to-primary" style={{ fontFamily: 'var(--font-tajawal), system-ui, sans-serif' }}>
        <SwipeablePages>{children}</SwipeablePages>
        <BottomNav />
      </body>
    </html>
  );
}
