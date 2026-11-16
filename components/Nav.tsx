'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { getCurrentUser } from '@/lib/mock-db';

const EASE = [0.16, 1, 0.3, 1] as const;

const LINKS = [
  ['Examples', '/#showcase'],
  ['How it works', '/#how'],
  ['Pricing', '/pricing'],
  ['FAQ', '/#faq'],
] as const;

interface NavProps {
  cta: {
    href: string;
    label: string;
    short?: string;
  };
}

function subscribeToSession(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSessionUserName(): string | null {
  const user = getCurrentUser();
  return user ? user.name.split(' ')[0] : null;
}

export default function Nav({ cta }: NavProps) {
  const pathname = usePathname();
  const [openedPath, setOpenedPath] = useState<string | null>(null);
  const open = openedPath === pathname;
  const setOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setOpenedPath((prevPath) => {
      const prevOpen = prevPath === pathname;
      const target = typeof next === 'function' ? next(prevOpen) : next;
      return target ? pathname : null;
    });
  };
  const ref = useRef<HTMLElement | null>(null);
  const openScrollYRef = useRef<number>(0);

  const userName = useSyncExternalStore(
    subscribeToSession,
    getSessionUserName,
    () => null
  );

  useEffect(() => {
    if (!open) return;
    openScrollYRef.current = window.scrollY;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenedPath(null);
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - openScrollYRef.current) > 48) {
        setOpenedPath(null);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenedPath(null);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  const mobileLinks = [
    ...LINKS.map(([label, href]) => ({ label, href })),
    {
      label: userName ? `My account (${userName})` : 'Sign in',
      href: userName ? '/account' : '/login',
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      {/* Blurred Scrim Behind Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-backdrop"
            aria-hidden="true"
            className="nav-mobile-backdrop fixed inset-0 z-20 bg-[#0f1633]/25 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav ref={ref} className={'nav' + (open ? ' open' : '')} aria-label="Main">
        <Logo />

        {/* Desktop horizontal nav */}
        <ul className="nav-desktop">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-r">
          <Link className="nav-signin hidden md:inline-block" href={userName ? '/account' : '/login'}>
            {userName ? 'My account' : 'Sign in'}
          </Link>
          <Link className="btn dark" href={cta.href}>
            <span className="full">{cta.label}</span>
            <span className="short">{cta.short || cta.label}</span>
          </Link>
          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
          </button>
        </div>

        {/* Choreographed Mobile Dropdown Panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav-menu"
              key="mobile-nav-panel"
              initial={{
                opacity: 0,
                y: -14,
                scale: 0.96,
                clipPath: 'inset(0 0 100% 0 round 24px)',
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                clipPath: 'inset(0 0 0% 0 round 24px)',
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.97,
                clipPath: 'inset(0 0 100% 0 round 24px)',
              }}
              transition={{ duration: 0.34, ease: EASE }}
              className="nav-mobile-panel absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-[24px] bg-white/95 backdrop-blur-xl border border-white p-2.5 shadow-[0_28px_60px_-14px_rgba(24,36,92,0.38)] origin-top"
            >
              <ul className="flex flex-col gap-1 list-none p-0 m-0">
                {mobileLinks.map((item, idx) => {
                  const isActive =
                    item.href === pathname || (item.href === '/#showcase' && pathname === '/');
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -12, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{
                        duration: 0.24,
                        delay: 0.05 + idx * 0.042,
                        ease: EASE,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center justify-between px-4 py-3 rounded-[15px] text-[15px] font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#f4f7fd] text-[#0f1633]'
                            : 'text-[#0f1633] hover:bg-[#f4f7fd]'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2.5">
                          {isActive && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#4a43e8]"
                              aria-hidden="true"
                            />
                          )}
                          <span>{item.label}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#5a6483] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#0f1633]" />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.24, delay: 0.24, ease: EASE }}
                className="mt-2 pt-2 border-t border-[#e3e9f6] flex items-center gap-2"
              >
                <Link
                  href={cta.href}
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] bg-[#d9f56b] text-[#0f1633] text-sm font-bold hover:brightness-95 transition-all"
                >
                  <span>{cta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </MotionConfig>
  );
}
