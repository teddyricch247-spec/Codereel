'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Clapperboard,
  Inbox,
  LayoutDashboard,
  Menu,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import Logo from './Logo';
import { PageEnter } from './MotionPrimitives';
import { emitMockDbChange, getMockDbVersion, subscribeMockDb } from '@/lib/db-events';
import { getDb, type MockDatabase } from '@/lib/mock-db';

interface AdminShellProps {
  breadcrumb: string;
  children: (db: MockDatabase, refresh: () => void) => React.ReactNode;
}

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Order queue', icon: Clapperboard, exact: false },
  { href: '/admin/clients', label: 'Clients', icon: Users, exact: true },
  { href: '/admin/inbox', label: 'Client inbox', icon: Inbox, exact: true },
  { href: '/admin/catalog', label: 'Catalog & billing', icon: SlidersHorizontal, exact: true },
];

function getAdminSnapshot(): string {
  if (typeof window === 'undefined') return 'ssr';
  const db = getDb();
  const openInq = db.inquiries.filter((i) => i.status === 'Open').length;
  const activeOrd = db.orders.filter(
    (o) => o.status === 'Rendering first cut' || o.status === 'Edit round in progress'
  ).length;
  return `${getMockDbVersion()}:${db.orders.length}:${activeOrd}:${openInq}:${db.receipts.length}`;
}

export default function AdminShell({ breadcrumb, children }: AdminShellProps) {
  const pathname = usePathname();
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

  const snap = useSyncExternalStore(subscribeMockDb, getAdminSnapshot, () => 'ssr');

  if (snap === 'ssr') {
    return (
      <div className="min-h-screen bg-[#f4f7fd] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white border border-[#e3e9f6] p-8 space-y-4">
          <div className="h-5 w-36 rounded bg-[#e3e9f6]" />
          <div className="h-4 w-56 rounded bg-[#f4f7fd]" />
          <div className="h-24 w-full rounded-xl bg-[#f4f7fd]" />
        </div>
      </div>
    );
  }

  const db = getDb();
  const openInquiriesCount = db.inquiries.filter((i) => i.status === 'Open').length;
  const activeOrdersCount = db.orders.filter(
    (o) => o.status === 'Rendering first cut' || o.status === 'Edit round in progress'
  ).length;

  const renderSidebar = (isMobile: boolean) => (
    <div className="flex flex-col h-full justify-between p-5">
      <div>
        <div className="flex items-center justify-between px-1 pb-5 border-b border-[#e3e9f6]">
          <div className="min-w-0">
            <Logo />
            <div className="mt-1.5 text-[11px] font-semibold tracking-tight text-[#5a6483]">
              Admin console · Studio operations
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-[#5a6483] hover:text-[#0f1633] hover:bg-[#f4f7fd] transition-colors cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-5 space-y-1" aria-label="Admin navigation">
          {ADMIN_NAV.map((item, idx) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            const count =
              item.href === '/admin/orders'
                ? activeOrdersCount
                : item.href === '/admin/inbox'
                ? openInquiriesCount
                : null;

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
                  className={`relative flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-[12px] text-sm font-semibold transition-colors whitespace-nowrap ${
                    active ? 'text-white' : 'text-[#5a6483] hover:bg-[#f4f7fd] hover:text-[#0f1633]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={isMobile ? 'admin-nav-mobile' : 'admin-nav-desktop'}
                      className="absolute inset-0 rounded-[12px] bg-[#0f1633] z-0"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#d9f56b]' : ''}`} />
                    <span>{item.label}</span>
                  </span>
                  {count !== null && count > 0 && (
                    <span
                      className={`relative z-10 text-xs font-mono-tabular ${
                        active ? 'text-[#d9f56b]' : 'text-[#4a43e8]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className="pt-5 border-t border-[#e3e9f6] space-y-2.5">
        <div className="px-2">
          <div className="text-xs font-semibold text-[#0f1633]">Prototype admin mode</div>
          <div className="text-[11px] text-[#5a6483]">
            Reads &amp; writes local mock DB
          </div>
        </div>
        <div className="flex items-center justify-between px-2 pt-1 gap-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-xs font-medium text-[#5a6483] hover:text-[#0f1633] whitespace-nowrap"
          >
            ← Public site
          </Link>
          <Link
            href="/account"
            onClick={() => setMobileOpen(false)}
            className="text-xs font-semibold text-[#4a43e8] hover:underline whitespace-nowrap"
          >
            Client studio →
          </Link>
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
                key="admin-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 bg-[#0f1633]/35 backdrop-blur-[5px]"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                key="admin-drawer-panel"
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
          <header className="h-16 bg-white border-b border-[#e3e9f6] px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2 -ml-2 rounded-lg text-[#0f1633] hover:bg-[#f4f7fd] active:scale-95 transition-transform cursor-pointer"
                aria-label="Open admin menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="text-xs sm:text-sm text-[#5a6483] truncate">
                <Link href="/admin" className="hover:text-[#0f1633]">
                  Admin
                </Link>
                <span className="mx-1.5 sm:mx-2 text-[#cbd5e1]">/</span>
                <span className="font-semibold text-[#0f1633]">{breadcrumb}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/admin/orders?new=1"
                className="px-3 sm:px-3.5 py-2 rounded-full border border-[#e3e9f6] bg-white hover:bg-[#f4f7fd] text-xs font-semibold text-[#0f1633] transition-colors whitespace-nowrap shrink-0"
              >
                + New order
              </Link>
              <Link
                href="/admin/orders"
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#0f1633] text-white text-xs font-semibold hover:bg-[#1e2956] transition-colors whitespace-nowrap shrink-0"
              >
                Order queue
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-8 max-w-[1220px] w-full mx-auto min-w-0">
            <PageEnter key={pathname}>{children(db, emitMockDbChange)}</PageEnter>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
