'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;
const PRE_SWITCH_MS = 220;
const SAFETY_TIMEOUT_MS = 3000;

type TransitionPhase = 'idle' | 'leaving' | 'entering';

function RouteTransitionObserver({
  onRouteArrived,
}: {
  onRouteArrived: (key: string) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    onRouteArrived(routeKey);
  }, [routeKey, onRouteArrived]);

  return null;
}

export default function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [routeCycle, setRouteCycle] = useState(0);

  const lastRouteKeyRef = useRef<string | null>(null);
  const switchTimerRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
    if (enterTimerRef.current) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const handleRouteArrived = useCallback(
    (nextKey: string) => {
      if (lastRouteKeyRef.current === null) {
        lastRouteKeyRef.current = nextKey;
        return;
      }
      if (lastRouteKeyRef.current === nextKey) {
        return;
      }
      lastRouteKeyRef.current = nextKey;
      clearTimers();
      setRouteCycle((c) => c + 1);
      setPhase('entering');
      enterTimerRef.current = window.setTimeout(() => {
        setPhase('idle');
      }, 320);
    },
    [clearTimers]
  );

  useEffect(() => {
    const onDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.hasAttribute('download')) return;

      const anchorTarget = anchor.getAttribute('target');
      if (anchorTarget && anchorTarget !== '_self') return;

      const rawHref = anchor.getAttribute('href') || '';
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:')
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const currentPathAndQuery = `${window.location.pathname}${window.location.search}`;
      const nextPathAndQuery = `${url.pathname}${url.search}`;

      // Same-page hash navigation should scroll immediately without route loader
      if (currentPathAndQuery === nextPathAndQuery) return;

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      e.preventDefault();
      clearTimers();
      setPhase('leaving');

      const destination = `${url.pathname}${url.search}${url.hash}`;
      switchTimerRef.current = window.setTimeout(() => {
        router.push(destination);
      }, PRE_SWITCH_MS);

      safetyTimerRef.current = window.setTimeout(() => {
        setPhase('idle');
      }, SAFETY_TIMEOUT_MS);
    };

    document.addEventListener('click', onDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', onDocumentClick, { capture: true });
      clearTimers();
    };
  }, [router, clearTimers, pathname]);

  const isLeaving = phase === 'leaving';
  const isActive = phase !== 'idle';

  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={null}>
        <RouteTransitionObserver onRouteArrived={handleRouteArrived} />
      </Suspense>

      {/* Top kinetic progress bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="route-progress"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed top-0 left-0 right-0 z-[120] h-[3px] pointer-events-none overflow-hidden"
          >
            <motion.div
              className="h-full w-full origin-left"
              style={{
                background: 'linear-gradient(90deg, #4a43e8 0%, #7ea5ff 58%, #d9f56b 100%)',
              }}
              initial={{ scaleX: 0.08 }}
              animate={{ scaleX: isLeaving ? 0.72 : 1 }}
              transition={{
                duration: isLeaving ? 0.2 : 0.24,
                ease: EASE,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split-second studio transition veil before page switch */}
      <AnimatePresence>
        {isLeaving && (
          <motion.div
            key="route-veil"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="fixed inset-0 z-[110] pointer-events-none bg-white/55 backdrop-blur-[6px] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -4 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0f1633] text-white shadow-[0_20px_44px_-14px_rgba(15,22,51,0.45)]"
            >
              <span
                className="w-5 h-5 rounded-[6px] relative inline-flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #4a43e8, #7fb0ff)' }}
              >
                <motion.span
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
                  className="block w-2.5 h-2.5 bg-[#d9f56b]"
                  style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
                />
              </span>
              <span className="text-xs font-semibold tracking-tight">Switching view</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smooth route content exit & reveal (opacity only so sticky/fixed inside pages stay anchored) */}
      <motion.div
        key={routeCycle}
        initial={routeCycle > 0 ? { opacity: 0 } : false}
        animate={isLeaving ? { opacity: 0.62 } : { opacity: 1 }}
        transition={{ duration: isLeaving ? 0.18 : 0.28, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
