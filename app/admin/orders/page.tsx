'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Plus, Search, Trash2, X } from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import {
  adminCreateOrder,
  adminDeleteOrder,
  adminUpdateOrder,
  STYLE_LABELS,
  type OrderStatus,
  type PlanSlug,
  type VideoStyle,
} from '@/lib/mock-db';

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All orders' },
  { key: 'action', label: 'Needs action' },
  { key: 'Rendering first cut', label: 'Rendering' },
  { key: 'Edit round in progress', label: 'In edits' },
  { key: 'done', label: 'Ready & Delivered' },
];

const ALL_STATUSES: OrderStatus[] = [
  'Rendering first cut',
  'Edit round in progress',
  'Ready to download',
  'Delivered',
];

const PRODUCERS = ['Unassigned', 'Samira Chen', 'Marcus Bell'];

function statusColor(status: OrderStatus): string {
  switch (status) {
    case 'Ready to download':
      return 'text-[#16a34a]';
    case 'Edit round in progress':
      return 'text-[#d97706]';
    case 'Rendering first cut':
      return 'text-[#4a43e8]';
    case 'Delivered':
      return 'text-[#5a6483]';
  }
}

function AdminOrdersQueueContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') ?? 'all';
  const validTab = STATUS_TABS.some((t) => t.key === initialStatus) ? initialStatus : 'all';

  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState(validTab);
  const [styleFilter, setStyleFilter] = useState<'all' | VideoStyle>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'Priority' | 'Standard'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Collapsible manual order creator
  const [showNewOrder, setShowNewOrder] = useState(() => searchParams.get('new') === '1');
  const [newUserId, setNewUserId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newStyle, setNewStyle] = useState<VideoStyle>('kinetic');
  const [newPlan, setNewPlan] = useState<PlanSlug>('single');
  const [newLength, setNewLength] = useState('30 seconds');
  const [newPriority, setNewPriority] = useState<'Priority' | 'Standard'>('Standard');
  const [newProducer, setNewProducer] = useState('Samira Chen');
  const [newResolution, setNewResolution] = useState('1080p MP4');
  const [newGoal, setNewGoal] = useState('');
  const [newCreateReceipt, setNewCreateReceipt] = useState(true);
  const [newErr, setNewErr] = useState('');

  return (
    <AdminShell breadcrumb="Order queue">
      {(db, refresh) => {
        const userMap = new Map(db.users.map((u) => [u.id, u]));
        const q = query.trim().toLowerCase();
        const todayStr = new Date().toISOString().slice(0, 10);
        const selectedClientId = newUserId || db.users[0]?.id || '';

        const filtered = db.orders.filter((o) => {
          const client = userMap.get(o.userId);
          if (statusTab === 'action') {
            if (o.status !== 'Rendering first cut' && o.status !== 'Edit round in progress') {
              return false;
            }
          } else if (statusTab === 'done') {
            if (o.status !== 'Ready to download' && o.status !== 'Delivered') {
              return false;
            }
          } else if (statusTab !== 'all' && o.status !== statusTab) {
            return false;
          }

          if (styleFilter !== 'all' && o.style !== styleFilter) return false;
          if (priorityFilter !== 'all' && (o.priority ?? 'Standard') !== priorityFilter) {
            return false;
          }

          if (q) {
            const hay = `${o.id} ${o.title} ${o.goal} ${client?.name ?? ''} ${
              client?.company ?? ''
            }`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });

        const handleCreateOrder = (e: React.FormEvent) => {
          e.preventDefault();
          setNewErr('');
          if (!selectedClientId) {
            setNewErr('Select a client workspace.');
            return;
          }
          if (newTitle.trim().length < 3 || newGoal.trim().length < 5) {
            setNewErr('Enter both a video title and brief goal.');
            return;
          }
          adminCreateOrder({
            userId: selectedClientId,
            title: newTitle,
            style: newStyle,
            plan: newPlan,
            length: newLength,
            goal: newGoal,
            assignedProducer: newProducer,
            priority: newPriority,
            resolution: newResolution,
            createReceipt: newCreateReceipt,
          });
          setNewTitle('');
          setNewGoal('');
          setShowNewOrder(false);
          refresh();
        };

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  Client order queue
                </h1>
                <p className="mt-1 text-sm text-[#5a6483]">
                  Assign producers, update production statuses directly, or open a brief to send
                  studio replies and deliver cuts.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono-tabular text-[#5a6483]">
                  {filtered.length} of {db.orders.length} shown
                </span>
                <button
                  type="button"
                  onClick={() => setShowNewOrder((v) => !v)}
                  className="btn lime"
                >
                  {showNewOrder ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Close form</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>New client order</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {showNewOrder && (
              <form
                onSubmit={handleCreateOrder}
                className="bg-white border border-[#e3e9f6] rounded-[24px] p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#0f1633]">Log manual client order</h2>
                  <span className="text-xs text-[#5a6483]">
                    Uses live catalog turnaround (
                    {db.catalogConfig.standardTurnaroundDays <= 1
                      ? '24h'
                      : `${db.catalogConfig.standardTurnaroundDays}d`}
                    )
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="no-client" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Client
                    </label>
                    <select
                      id="no-client"
                      value={selectedClientId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#0f1633]"
                    >
                      {db.users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="no-title" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Video title
                    </label>
                    <input
                      id="no-title"
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Series A Feature Reel"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs text-[#0f1633]"
                    />
                  </div>

                  <div>
                    <label htmlFor="no-style" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Style
                    </label>
                    <select
                      id="no-style"
                      value={newStyle}
                      onChange={(e) => setNewStyle(e.target.value as VideoStyle)}
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#0f1633]"
                    >
                      <option value="kinetic">Kinetic type</option>
                      <option value="demo">Product demo</option>
                      <option value="data">Data story</option>
                      <option value="code">Code explainer</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="no-plan" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Plan &amp; length
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="New order plan"
                        value={newPlan}
                        onChange={(e) => setNewPlan(e.target.value as PlanSlug)}
                        className="rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-2.5 py-2 text-xs font-semibold text-[#0f1633]"
                      >
                        <option value="single">Single</option>
                        <option value="pack">Pack</option>
                        <option value="long">Long</option>
                      </select>
                      <select
                        aria-label="New order length"
                        value={newLength}
                        onChange={(e) => setNewLength(e.target.value)}
                        className="rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-2.5 py-2 text-xs font-semibold text-[#0f1633]"
                      >
                        <option value="15 seconds">15s</option>
                        <option value="30 seconds">30s</option>
                        <option value="60 seconds">60s</option>
                        <option value="90 seconds">90s</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="no-prod" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Producer
                    </label>
                    <select
                      id="no-prod"
                      value={newProducer}
                      onChange={(e) => setNewProducer(e.target.value)}
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#0f1633]"
                    >
                      {PRODUCERS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="no-pri" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Priority &amp; format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="New order priority"
                        value={newPriority}
                        onChange={(e) =>
                          setNewPriority(e.target.value as 'Priority' | 'Standard')
                        }
                        className="rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-2.5 py-2 text-xs font-semibold text-[#0f1633]"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Priority">Priority</option>
                      </select>
                      <select
                        aria-label="New order resolution"
                        value={newResolution}
                        onChange={(e) => setNewResolution(e.target.value)}
                        className="rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-2.5 py-2 text-xs font-semibold text-[#0f1633]"
                      >
                        <option value="1080p MP4">1080p MP4</option>
                        <option value="4K MP4">4K MP4</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="no-goal" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Brief goal
                    </label>
                    <input
                      id="no-goal"
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="What is the video for?"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs text-[#0f1633]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0f1633] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCreateReceipt}
                      onChange={(e) => setNewCreateReceipt(e.target.checked)}
                      className="w-4 h-4 accent-[#4a43e8]"
                    />
                    <span>Also add paid mock invoice receipt to ledger</span>
                  </label>
                  <button type="submit" className="btn dark">
                    Create order in queue
                  </button>
                </div>
                {newErr && <p className="text-xs font-medium text-[#a3173f]">{newErr}</p>}
              </form>
            )}

            {/* Filter Toolbar */}
            <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-4 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f4f7fd] rounded-[12px]">
                  {STATUS_TABS.map((tab) => {
                    const active = statusTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setStatusTab(tab.key)}
                        className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-white text-[#0f1633] shadow-xs'
                            : 'text-[#5a6483] hover:text-[#0f1633]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-[#5a6483] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search order ID, title, or client…"
                      aria-label="Search orders"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] pl-9 pr-3 py-2 text-xs text-[#0f1633] placeholder:text-[#8691b0]"
                    />
                  </div>

                  <select
                    aria-label="Filter by video style"
                    value={styleFilter}
                    onChange={(e) => setStyleFilter(e.target.value as 'all' | VideoStyle)}
                    className="rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#0f1633]"
                  >
                    <option value="all">All styles</option>
                    <option value="kinetic">Kinetic type</option>
                    <option value="demo">Product demo</option>
                    <option value="data">Data story</option>
                    <option value="code">Code explainer</option>
                  </select>

                  <select
                    aria-label="Filter by priority"
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(e.target.value as 'all' | 'Priority' | 'Standard')
                    }
                    className="rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#0f1633]"
                  >
                    <option value="all">All priorities</option>
                    <option value="Priority">Priority</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <h2 className="text-base font-bold text-[#0f1633]">No orders match filters</h2>
                  <p className="mt-1 text-sm text-[#5a6483]">
                    Clear search text or switch tabs to see all prototype orders.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setStatusTab('all');
                      setStyleFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="btn dark mt-4"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e9f6] text-[12px] font-semibold text-[#5a6483] bg-[#f4f7fd]/70">
                        <th className="py-3 px-6">Order &amp; Brief</th>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Producer</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Edits</th>
                        <th className="py-3 px-4">Target ETA</th>
                        <th className="py-3 px-6 text-right">Workspace</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e9f6] text-sm">
                      {filtered.map((order) => {
                        const client = userMap.get(order.userId);
                        const isOverdue =
                          !order.deliveredAt &&
                          (order.status === 'Rendering first cut' ||
                            order.status === 'Edit round in progress') &&
                          order.etaDate < todayStr;
                        const confirming = confirmDeleteId === order.id;

                        return (
                          <tr key={order.id} className="hover:bg-[#f4f7fd]/40 transition-colors">
                            <td className="py-3.5 px-6 max-w-[300px]">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                                  style={{ background: order.brandColor }}
                                  aria-hidden="true"
                                />
                                <Link
                                  href={`/admin/orders/${order.id}`}
                                  className="font-semibold text-[#0f1633] hover:text-[#4a43e8] truncate"
                                >
                                  {order.title}
                                </Link>
                              </div>
                              <div className="mt-0.5 text-xs text-[#5a6483] truncate">
                                <span className="font-mono-tabular">{order.id}</span> ·{' '}
                                {STYLE_LABELS[order.style]} · {order.length}
                                {order.priority === 'Priority' && (
                                  <span className="text-[#4a43e8] font-semibold"> · Priority</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-medium text-[#0f1633]">
                                {client?.name ?? 'Unknown'}
                              </div>
                              <div className="text-xs text-[#5a6483]">{client?.company}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                aria-label={`Producer for ${order.id}`}
                                value={order.assignedProducer || 'Unassigned'}
                                onChange={(e) => {
                                  adminUpdateOrder(order.id, { assignedProducer: e.target.value });
                                  refresh();
                                }}
                                className="rounded-[10px] border border-[#e3e9f6] bg-[#f4f7fd] px-2.5 py-1.5 text-xs font-medium text-[#0f1633]"
                              >
                                {PRODUCERS.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                aria-label={`Status for ${order.id}`}
                                value={order.status}
                                onChange={(e) => {
                                  adminUpdateOrder(order.id, {
                                    status: e.target.value as OrderStatus,
                                  });
                                  refresh();
                                }}
                                className={`rounded-[10px] border border-[#e3e9f6] bg-white px-2.5 py-1.5 text-xs font-semibold ${statusColor(
                                  order.status
                                )}`}
                              >
                                {ALL_STATUSES.map((s) => (
                                  <option key={s} value={s} className="text-[#0f1633]">
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right text-xs font-mono-tabular text-[#5a6483] whitespace-nowrap">
                              {order.editsUsed}/{order.editsTotal}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono-tabular text-[#5a6483] whitespace-nowrap">
                              {order.deliveredAt || order.etaDate}
                              {isOverdue && (
                                <span className="font-sans font-semibold text-[#dc2626]">
                                  {' '}
                                  · Overdue
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                {confirming ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        adminDeleteOrder(order.id);
                                        setConfirmDeleteId(null);
                                        refresh();
                                      }}
                                      className="px-2.5 py-1 rounded-full bg-[#a3173f] text-white text-xs font-semibold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-2 py-1 text-xs font-semibold text-[#5a6483] hover:text-[#0f1633] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      aria-label={`Delete order ${order.id}`}
                                      onClick={() => setConfirmDeleteId(order.id)}
                                      className="p-1.5 rounded-full text-[#5a6483] hover:text-[#a3173f] hover:bg-[#fff4f7] transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <Link
                                      href={`/admin/orders/${order.id}`}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0f1633] hover:bg-[#1e2956] text-xs font-semibold text-white whitespace-nowrap"
                                    >
                                      <span>Manage</span>
                                      <ArrowRight className="w-3 h-3 text-[#d9f56b]" />
                                    </Link>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </AdminShell>
  );
}

export default function AdminOrdersQueuePage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersQueueContent />
    </Suspense>
  );
}

