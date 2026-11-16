'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  CreditCard,
  Film,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import Logo from './Logo';
import Clouds from './Clouds';
import { PageEnter } from './MotionPrimitives';
import { emitMockDbChange, getMockDbVersion, subscribeMockDb } from '@/lib/db-events';
import {
  getCurrentUser,
  getDb,
  loginAsDemoUser,
  logoutMockUser,
  type MockUser,
} from '@/lib/mock-db';

export { emitMockDbChange };

interface AccountShellProps {
  breadcrumb: string;
  children: (user: MockUser, refresh: () => void) => React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'My videos', icon: Film, exact: false },
  { href: '/account/brand', label: 'Brand kit', icon: Palette, exact: true },
  { href: '/account/billing', label: 'Billing & data', icon: CreditCard, exact: true },
  { href: '/account/settings', label: 'Settings', icon: Settings, exact: true },
];

function getSnapshot(): string {
  if (typeof window === 'undefined') return 'ssr';
  const u = getCurrentUser();
  const ver = getMockDbVersion();
  return u ? `${ver}:${u.id}:${u.packCreditsRemaining}:${u.company}` : `${ver}:none`;
}

export default function AccountShell({ breadcrumb, children }: AccountShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenPath === pathname;
  const setMobileOpen = (next: boolean) => setMobileOpenPath(next ? pathname : null);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpenPath(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const sessionSnap = useSyncExternalStore(subscribeMockDb, getSnapshot, () => 'ssr');

  if (sessionSnap === 'ssr') {
    return (
      <div className="min-h-screen bg-[#f4f7fd] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white border border-[#e3e9f6] p-8 space-y-4">
          <div className="h-5 w-32 rounded bg-[#e3e9f6]" />
          <div className="h-4 w-56 rounded bg-[#f4f7fd]" />
          <div className="h-24 w-full rounded-xl bg-[#f4f7fd]" />
        </div>
      </div>
    );
  }

  const user = getCurrentUser();

  if (!user) {
    const demoUsers = getDb().users.slice(0, 2);
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="hero flex-1 flex flex-col" style={{ marginBottom: '14px' }}>
          <Clouds />
          <div className="wrap flex-1 flex items-center justify-center py-16">
            <div className="w-full max-w-lg bg-white border border-[#e3e9f6] rounded-[28px] p-8 shadow-[0_30px_60px_-32px_rgba(42,58,140,0.4)] relative z-10">
              <Logo />
              <h1 className="mt-6 text-2xl font-bold text-[#0f1633] tracking-tight">
                Sign in to open your studio
              </h1>
              <p className="mt-2 text-sm text-[#5a6483]">
                Pick a prototype account from <code className="font-mono-tabular text-xs">/data/mock-db.json</code> or sign in with your own mock email.
              </p>

              <div className="mt-6 space-y-2.5">
                {demoUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      loginAsDemoUser(u.email);
                      emitMockDbChange();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] bg-[#f4f7fd] hover:bg-[#e9f1ff] border border-[#e3e9f6] text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#0f1633]">{u.name}</div>
                      <div className="text-xs text-[#5a6483]">
                        {u.company} · {u.email}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#4a43e8] whitespace-nowrap">
                      Enter studio →
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-[#e3e9f6] flex items-center justify-between text-sm">
                <Link href="/login" className="font-semibold text-[#4a43e8] hover:underline">
                  Go to Sign in page
                </Link>
                <Link href="/signup" className="font-semibold text-[#0f1633] hover:underline">
                  Create prototype account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMockUser();
    emitMockDbChange();
    router.push('/login');
  };

  const renderSidebar = (isMobile: boolean) => (
    <div className="flex flex-col h-full justify-between p-5">
      <div>
        <div className="flex items-center justify-between px-1 pb-6 border-b border-[#e3e9f6]">
          <Logo />
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-[#5a6483] hover:text-[#0f1633] hover:bg-[#f4f7fd] transition-colors cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-5 space-y-1" aria-label="Account navigation">
          {NAV_ITEMS.map((item, idx) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={isMobile ? { opacity: 0, x: -14 } : false}
                animate={isMobile ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.24, delay: isMobile ? 0.06 + idx * 0.04 : 0, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-semibold transition-colors whitespace-nowrap ${
                    active ? 'text-white' : 'text-[#5a6483] hover:bg-[#f4f7fd] hover:text-[#0f1633]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={isMobile ? 'account-nav-mobile' : 'account-nav-desktop'}
                      className="absolute inset-0 rounded-[12px] bg-[#0f1633] z-0"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-4 h-4 shrink-0 ${active ? 'text-[#d9f56b]' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-6 pt-5 border-t border-[#e3e9f6]">
          <Link
            href="/order"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#d9f56b] text-[#0f1633] text-sm font-semibold hover:brightness-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New video order</span>
          </Link>
        </div>
      </div>

      <div className="pt-5 border-t border-[#e3e9f6] space-y-3">
        <div className="px-2">
          <div className="text-sm font-semibold text-[#0f1633] truncate">{user.name}</div>
          <div className="text-xs text-[#5a6483] truncate">
            {user.company} · {user.email}
          </div>
        </div>
        <div className="flex items-center justify-between px-2 pt-1 gap-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-xs font-medium text-[#5a6483] hover:text-[#0f1633] whitespace-nowrap"
          >
            ← Site
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="text-xs font-semibold text-[#4a43e8] hover:underline whitespace-nowrap"
          >
            Admin console
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5a6483] hover:text-[#a3173f] cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f4f7fd] flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-[#e3e9f6] sticky top-0 h-screen">
          {renderSidebar(false)}
        </aside>

        {/* Animated Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                key="account-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 bg-[#0f1633]/35 backdrop-blur-[5px]"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                key="account-drawer-panel"
                initial={{ x: '-104%' }}
                animate={{ x: 0 }}
                exit={{ x: '-104%' }}
                transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.9 }}
                className="relative w-72 max-w-[85vw] bg-white h-full border-r border-[#e3e9f6] z-10 shadow-[0_24px_60px_-16px_rgba(15,22,51,0.35)]"
              >
                {renderSidebar(true)}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-16 bg-white border-b border-[#e3e9f6] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2 -ml-2 rounded-lg text-[#0f1633] hover:bg-[#f4f7fd] active:scale-95 transition-transform cursor-pointer"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="text-sm text-[#5a6483] truncate">
                <Link href="/account" className="hover:text-[#0f1633]">
                  Studio
                </Link>
                <span className="mx-2 text-[#cbd5e1]">/</span>
                <span className="font-semibold text-[#0f1633]">{breadcrumb}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {user.packCreditsRemaining > 0 && (
                <span className="hidden sm:inline text-xs font-medium text-[#5a6483] tabular-nums whitespace-nowrap">
                  {user.packCreditsRemaining} pack {user.packCreditsRemaining === 1 ? 'credit' : 'credits'} available
                </span>
              )}
              <Link
                href="/order"
                className="px-4 py-2 rounded-full bg-[#0f1633] text-white text-xs font-semibold hover:bg-[#1e2956] transition-colors whitespace-nowrap shrink-0"
              >
                Order video
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-8 max-w-[1160px] w-full mx-auto">
            <PageEnter key={pathname}>{children(user, emitMockDbChange)}</PageEnter>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
