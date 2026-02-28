'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

const TAB_ROUTES = ['/', '/transactions', '/debts', '/settings'] as const;
const SWIPE_THRESHOLD = 60;
/** Dampening: content follows finger at ~35% for magnetic resistance (iOS-like) */
const DRAG_DAMPING = 0.35;
const MAX_DRAG = 120;

function SwipeablePages({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tabIndex = TAB_ROUTES.findIndex((r) => pathname === r);
  const isMainTab = tabIndex >= 0;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMainTab || isAnimating) return;
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setDragX(0);
    },
    [isMainTab, isAnimating]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isMainTab || !touchStart.current) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - touchStart.current.x;
      const dy = y - touchStart.current.y;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      const damped = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx * DRAG_DAMPING));
      setDragX(damped);
    },
    [isMainTab]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isMainTab || !touchStart.current) return;
      const end = e.changedTouches[0];
      const dx = end.clientX - touchStart.current.x;
      const dy = end.clientY - touchStart.current.y;
      touchStart.current = null;

      if (Math.abs(dx) < Math.abs(dy)) {
        setDragX(0);
        return;
      }

      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        if (dx < 0 && tabIndex < TAB_ROUTES.length - 1) {
          setIsAnimating(true);
          setDragX(-MAX_DRAG);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              router.push(TAB_ROUTES[tabIndex + 1]);
              setDragX(0);
              setIsAnimating(false);
            });
          });
          return;
        }
        if (dx > 0 && tabIndex > 0) {
          setIsAnimating(true);
          setDragX(MAX_DRAG);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              router.push(TAB_ROUTES[tabIndex - 1]);
              setDragX(0);
              setIsAnimating(false);
            });
          });
          return;
        }
      }

      setDragX(0);
    },
    [isMainTab, tabIndex, router]
  );

  const handleTouchCancel = useCallback(() => {
    touchStart.current = null;
    setDragX(0);
  }, []);

  return (
    <div
      className="flex flex-1 flex-col min-h-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: isMainTab ? 'pan-y' : undefined }}
    >
      <div
        className="flex flex-1 flex-col min-h-0 will-change-transform"
        style={{
          transform: `translate3d(${dragX}px, 0, 0)`,
          transition: isAnimating ? 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)' : dragX === 0 ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeablePages;
