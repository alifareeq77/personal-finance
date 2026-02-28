'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ar } from '@/lib/ar';

const iconProps = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const navIcons = {
  Home: () => <svg {...iconProps}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>,
  Receipt: () => <svg {...iconProps}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" /><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8" /><path d="M12 8V6" /></svg>,
  Wallet: () => <svg {...iconProps}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><path d="M1 10h22" /></svg>,
  Settings: () => <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 110 14 7 7 0 010-14z" /></svg>,
};

const navItems: { href: string; label: string; icon: keyof typeof navIcons }[] = [
  { href: '/', label: ar.nav.home, icon: 'Home' },
  { href: '/transactions', label: ar.nav.transactions, icon: 'Receipt' },
  { href: '/debts', label: ar.nav.debts, icon: 'Wallet' },
  { href: '/settings', label: ar.nav.settings, icon: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-2"
      style={{ paddingBottom: 'calc(0.5rem + var(--safe-bottom))' }}
    >
      <div className="nav-glass-pill flex items-center justify-evenly rounded-full px-1 py-1">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const Icon = navIcons[icon];
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="relative flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-full transition-colors active:opacity-80"
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              {isActive && <span className="nav-item-pill" aria-hidden />}
              <span
                className={`relative z-10 flex items-center justify-center [&_svg]:shrink-0 ${isActive ? 'text-secondary' : 'text-gray-500'}`}
                aria-hidden
              >
                <Icon />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
