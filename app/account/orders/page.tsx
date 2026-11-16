'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Plus, Search } from 'lucide-react';
import AccountShell from '@/components/AccountShell';
import { getUserOrders, STYLE_LABELS, type OrderStatus, type VideoStyle } from '@/lib/mock-db';

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

export default function OrdersListPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'active'>('all');
  const [styleFilter, setStyleFilter] = useState<'all' | VideoStyle>('all');

  return (
    <AccountShell breadcrumb="My videos">
      {(user) => {
        const allOrders = getUserOrders(user.id);
        const filtered = allOrders.filter((o) => {
          const matchesSearch =
            !query.trim() ||
            o.title.toLowerCase().includes(query.toLowerCase()) ||
            o.id.toLowerCase().includes(query.toLowerCase()) ||
            o.goal.toLowerCase().includes(query.toLowerCase());

          const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'ready' &&
              (o.status === 'Ready to download' || o.status === 'Delivered')) ||
            (statusFilter === 'active' &&
              (o.status === 'Rendering first cut' || o.status === 'Edit round in progress'));

          const matchesStyle = styleFilter === 'all' || o.style === styleFilter;
          return matchesSearch && matchesStatus && matchesStyle;
        });

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  My videos
                </h1>
                <p className="mt-1 text-sm text-[#5a6483]">
                  Review cuts, submit edit rounds, or reorder any previous style.
                </p>
              </div>
              <Link href="/order" className="btn lime shrink-0">
                <Plus className="w-4 h-4" />
                <span>New video order</span>
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#5a6483] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  placeholder="Search by title, brief, or ID…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] pl-10 pr-3.5 py-2 text-sm text-[#0f1633] placeholder:text-[#8691b0]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1 p-1 bg-[#f4f7fd] rounded-[12px]" role="group" aria-label="Filter by status">
                  {(
                    [
                      ['all', 'All'],
                      ['ready', 'Ready'],
                      ['active', 'In progress'],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setStatusFilter(val)}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        statusFilter === val
                          ? 'bg-white text-[#0f1633] shadow-xs'
                          : 'text-[#5a6483] hover:text-[#0f1633]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
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
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-semibold text-[#0f1633]">No matching videos found</p>
                  <p className="mt-1 text-xs text-[#5a6483]">
                    Try clearing your search or status filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e9f6] text-xs font-semibold text-[#5a6483] bg-[#f4f7fd]/50">
                        <th className="py-3.5 px-5">Video</th>
                        <th className="py-3.5 px-4">Style</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Edits</th>
                        <th className="py-3.5 px-4 text-right">Target / Size</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e9f6] text-sm">
                      {filtered.map((order) => (
                        <tr key={order.id} className="hover:bg-[#f4f7fd]/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ background: order.brandColor }}
                                aria-hidden="true"
                              />
                              <div>
                                <Link
                                  href={`/account/orders/${order.id}`}
                                  className="font-semibold text-[#0f1633] hover:text-[#4a43e8]"
                                >
                                  {order.title}
                                </Link>
                                <div className="text-xs text-[#5a6483] font-mono-tabular">
                                  {order.id} · {order.length}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#0f1633] whitespace-nowrap">
                            {STYLE_LABELS[order.style]}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`font-semibold text-xs ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-[#5a6483] whitespace-nowrap">
                            {order.editsUsed}/{order.editsTotal} used
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-[#5a6483] whitespace-nowrap">
                            {order.deliveredAt ? order.fileSize : `ETA ${order.etaDate}`}
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={`/order?style=${order.style}`}
                                className="px-3 py-1.5 rounded-full border border-[#e3e9f6] hover:bg-[#f4f7fd] text-xs font-semibold text-[#5a6483] hover:text-[#0f1633]"
                              >
                                Reorder
                              </Link>
                              <Link
                                href={`/account/orders/${order.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0f1633] text-white text-xs font-semibold hover:bg-[#1e2956]"
                              >
                                <span>Review</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </AccountShell>
  );
}
