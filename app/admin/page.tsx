'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Clock, Inbox, Plus } from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import { loginAsDemoUser, STYLE_LABELS, type OrderStatus } from '@/lib/mock-db';

function statusTextClass(status: OrderStatus): string {
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

export default function AdminOverviewPage() {
  const router = useRouter();

  return (
    <AdminShell breadcrumb="Overview">
      {(db) => {
        const userMap = new Map(db.users.map((u) => [u.id, u]));
        const todayStr = new Date().toISOString().slice(0, 10);

        const activeOrders = db.orders
          .filter(
            (o) => o.status === 'Rendering first cut' || o.status === 'Edit round in progress'
          )
          .sort((a, b) => (a.priority === 'Priority' && b.priority !== 'Priority' ? -1 : 1));

        const renderingCount = db.orders.filter((o) => o.status === 'Rendering first cut').length;
        const editsCount = db.orders.filter((o) => o.status === 'Edit round in progress').length;
        const readyCount = db.orders.filter((o) => o.status === 'Ready to download').length;
        const deliveredCount = db.orders.filter((o) => o.status === 'Delivered').length;

        const openInquiries = db.inquiries.filter((i) => i.status === 'Open');

        const paidRevenue = db.receipts
          .filter((r) => r.status.toLowerCase() === 'paid')
          .reduce((sum, r) => sum + r.amount, 0);

        const recentClientNotes = db.orders
          .flatMap((o) =>
            o.revisions
              .filter((r) => r.role === 'client')
              .map((r) => ({
                ...r,
                orderId: o.id,
                orderTitle: o.title,
                orderStatus: o.status,
              }))
          )
          .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
          .slice(0, 4);

        const slaLabel =
          db.catalogConfig.standardTurnaroundDays <= 1
            ? '24h SLA'
            : `${db.catalogConfig.standardTurnaroundDays}d SLA`;

        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  Studio operations overview
                </h1>
                <p className="mt-1 text-sm text-[#5a6483]">
                  Review incoming client briefs, manage {slaLabel} renders, respond to edit notes,
                  and update pack credits.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/admin/inbox"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#e3e9f6] hover:bg-[#e9f1ff] text-xs font-semibold text-[#0f1633] whitespace-nowrap"
                >
                  <Inbox className="w-3.5 h-3.5 text-[#4a43e8]" />
                  <span>Inbox ({openInquiries.length})</span>
                </Link>
                <Link
                  href="/admin/orders?new=1"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#e3e9f6] hover:bg-[#e9f1ff] text-xs font-semibold text-[#0f1633] whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0f1633]" />
                  <span>New order</span>
                </Link>
                <Link href="/admin/orders" className="btn lime">
                  <span>All orders ({db.orders.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 4-Column KPI Strip */}
            <section aria-label="Studio KPIs">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-4 sm:p-5">
                  <div className="text-xs font-medium text-[#5a6483]">Active production</div>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#0f1633] tabular-nums">
                    {activeOrders.length}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">
                    Rendering or in client edits
                  </div>
                </div>
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-4 sm:p-5">
                  <div className="text-xs font-medium text-[#5a6483]">Open client inquiries</div>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#0f1633] tabular-nums">
                    {openInquiries.length}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">
                    Waiting for studio reply
                  </div>
                </div>
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-4 sm:p-5">
                  <div className="text-xs font-medium text-[#5a6483]">Mock gross revenue</div>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#0f1633] tabular-nums">
                    ${paidRevenue.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">
                    Across {db.receipts.length} prototype receipts
                  </div>
                </div>
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-4 sm:p-5">
                  <div className="text-xs font-medium text-[#5a6483]">Registered clients</div>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#0f1633] tabular-nums">
                    {db.users.length}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">
                    {db.users.reduce((s, u) => s + u.packCreditsRemaining, 0)} pack credits active
                  </div>
                </div>
              </div>
            </section>

            {/* 4-Stage Pipeline Breakdown */}
            <section
              aria-label="Production pipeline stages"
              className="bg-white border border-[#e3e9f6] rounded-[20px] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-bold text-[#0f1633]">Pipeline breakdown</h2>
                <span className="text-xs font-mono-tabular text-[#5a6483]">{slaLabel} target</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(
                  [
                    {
                      label: 'Rendering first cut',
                      count: renderingCount,
                      href: '/admin/orders?status=Rendering%20first%20cut',
                      accent: 'text-[#4a43e8]',
                    },
                    {
                      label: 'Edit round in progress',
                      count: editsCount,
                      href: '/admin/orders?status=Edit%20round%20in%20progress',
                      accent: 'text-[#d97706]',
                    },
                    {
                      label: 'Ready to download',
                      count: readyCount,
                      href: '/admin/orders?status=done',
                      accent: 'text-[#16a34a]',
                    },
                    {
                      label: 'Delivered archive',
                      count: deliveredCount,
                      href: '/admin/orders?status=done',
                      accent: 'text-[#5a6483]',
                    },
                  ] as const
                ).map((stage) => (
                  <Link
                    key={stage.label}
                    href={stage.href}
                    className="rounded-[14px] bg-[#f4f7fd] hover:bg-[#e9f1ff] border border-[#e3e9f6] p-3.5 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold leading-snug ${stage.accent}`}>
                        {stage.label}
                      </div>
                      <div className="mt-1 text-xl font-bold text-[#0f1633] tabular-nums">
                        {stage.count}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#5a6483] shrink-0" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Incoming & Attention Queue */}
            <section className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e3e9f6] flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0f1633]">Needs studio action</h2>
                  <p className="text-xs text-[#5a6483] mt-0.5">
                    Orders waiting on first cut render, producer assignment, or edit turnaround
                  </p>
                </div>
                <Link
                  href="/admin/orders?status=action"
                  className="text-xs font-semibold text-[#4a43e8] hover:underline whitespace-nowrap"
                >
                  Open queue →
                </Link>
              </div>

              {activeOrders.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#16a34a] mx-auto" />
                  <h3 className="mt-3 text-base font-semibold text-[#0f1633]">
                    Queue is clear
                  </h3>
                  <p className="mt-1 text-sm text-[#5a6483]">
                    Every order has been delivered or marked ready to download.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e9f6] text-[12px] font-semibold text-[#5a6483] bg-[#f4f7fd]/70">
                        <th className="py-3 px-6">Order</th>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Spec</th>
                        <th className="py-3 px-4">Producer</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Target ETA</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e9f6] text-sm">
                      {activeOrders.map((order) => {
                        const client = userMap.get(order.userId);
                        const isOverdue = order.etaDate < todayStr;
                        return (
                          <tr key={order.id} className="hover:bg-[#f4f7fd]/50 transition-colors">
                            <td className="py-3.5 px-6">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="font-semibold text-[#0f1633] hover:text-[#4a43e8]"
                              >
                                {order.title}
                              </Link>
                              <div className="text-xs text-[#5a6483] font-mono-tabular mt-0.5">
                                {order.id}
                                {order.priority === 'Priority' && (
                                  <span className="text-[#4a43e8] font-sans font-semibold">
                                    {' '}
                                    · Priority
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-medium text-[#0f1633]">
                                {client?.name ?? 'Unknown'}
                              </div>
                              <div className="text-xs text-[#5a6483]">{client?.company}</div>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-[#5a6483] whitespace-nowrap">
                              {STYLE_LABELS[order.style]} · {order.length}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-[#0f1633] whitespace-nowrap">
                              {order.assignedProducer || 'Unassigned'}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">
                              <span className={statusTextClass(order.status)}>{order.status}</span>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono-tabular text-[#5a6483] whitespace-nowrap">
                              {order.etaDate}
                              {isOverdue && (
                                <span className="font-sans font-semibold text-[#dc2626]">
                                  {' '}
                                  · Overdue
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f4f7fd] hover:bg-[#e9f1ff] text-xs font-semibold text-[#0f1633] whitespace-nowrap"
                              >
                                <span>Manage</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Bottom Split: Client Edit Requests + Open Inbox Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <section className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e3e9f6] flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#0f1633]">Latest client edit notes</h2>
                  <Link href="/admin/orders" className="text-xs font-semibold text-[#4a43e8] hover:underline">
                    All orders
                  </Link>
                </div>
                {recentClientNotes.length === 0 ? (
                  <p className="p-6 text-sm text-[#5a6483]">No client revision notes logged yet.</p>
                ) : (
                  <div className="divide-y divide-[#e3e9f6]">
                    {recentClientNotes.map((note) => (
                      <div key={note.id} className="px-6 py-4 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a6483]">
                          <span className="font-semibold text-[#0f1633]">
                            {note.author} · <span className="font-mono-tabular">{note.orderId}</span>
                          </span>
                          <span className="font-mono-tabular">
                            @{note.timecode} · {note.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-[#0f1633]">{note.note}</p>
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className="text-[#5a6483] truncate">{note.orderTitle}</span>
                          <Link
                            href={`/admin/orders/${note.orderId}`}
                            className="font-semibold text-[#4a43e8] hover:underline whitespace-nowrap"
                          >
                            Respond &amp; deliver →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e3e9f6] flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#0f1633]">Open client inquiries</h2>
                  <Link href="/admin/inbox" className="text-xs font-semibold text-[#4a43e8] hover:underline">
                    Open inbox
                  </Link>
                </div>
                {openInquiries.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#5a6483]">
                    <Clock className="w-6 h-6 mx-auto text-[#5a6483] mb-2" />
                    All client inquiries have been answered.
                  </div>
                ) : (
                  <div className="divide-y divide-[#e3e9f6]">
                    {openInquiries.map((inq) => {
                      const client = userMap.get(inq.userId);
                      return (
                        <div key={inq.id} className="px-6 py-4 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-[#5a6483]">
                            <span className="font-semibold text-[#0f1633]">
                              {client?.name ?? 'Client'} ({client?.company})
                            </span>
                            <span className="font-mono-tabular">{inq.createdAt}</span>
                          </div>
                          <div className="text-sm font-semibold text-[#0f1633]">{inq.subject}</div>
                          <p className="text-sm text-[#5a6483] line-clamp-2">{inq.message}</p>
                          <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono-tabular text-[#5a6483]">
                              {inq.orderId ? `Order ${inq.orderId}` : inq.id}
                            </span>
                            <div className="flex items-center gap-3">
                              {client && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    loginAsDemoUser(client.email);
                                    router.push('/account');
                                  }}
                                  className="font-medium text-[#5a6483] hover:text-[#0f1633] cursor-pointer whitespace-nowrap"
                                >
                                  Open as client
                                </button>
                              )}
                              <Link
                                href="/admin/inbox"
                                className="font-semibold text-[#4a43e8] hover:underline whitespace-nowrap"
                              >
                                Reply in inbox →
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        );
      }}
    </AdminShell>
  );
}

