'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, Film, MessageSquare, Palette, Plus, Send } from 'lucide-react';
import AccountShell from '@/components/AccountShell';
import Clouds from '@/components/Clouds';
import {
  createClientInquiry,
  getUserBrandKit,
  getUserInquiries,
  getUserOrders,
  STYLE_LABELS,
  type OrderStatus,
} from '@/lib/mock-db';

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

export default function AccountOverviewPage() {
  const [subject, setSubject] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [inqError, setInqError] = useState('');
  const [inqSent, setInqSent] = useState(false);

  return (
    <AccountShell breadcrumb="Overview">
      {(user, refresh) => {
        const orders = getUserOrders(user.id);
        const kit = getUserBrandKit(user.id);
        const inquiries = getUserInquiries(user.id);
        const readyCount = orders.filter(
          (o) => o.status === 'Ready to download' || o.status === 'Delivered'
        ).length;
        const activeCount = orders.filter(
          (o) => o.status === 'Rendering first cut' || o.status === 'Edit round in progress'
        ).length;

        const handleAskStudio = (e: React.FormEvent) => {
          e.preventDefault();
          setInqError('');
          if (subject.trim().length < 3) {
            setInqError('Add a short subject (at least 3 characters).');
            return;
          }
          if (message.trim().length < 5) {
            setInqError('Write your question or note for the studio (at least 5 characters).');
            return;
          }
          createClientInquiry({
            userId: user.id,
            orderId: orderId || undefined,
            subject,
            message,
          });
          setSubject('');
          setOrderId('');
          setMessage('');
          setInqSent(true);
          refresh();
          setTimeout(() => setInqSent(false), 3500);
        };

        return (
          <div className="space-y-8">
            {/* Atmospheric Welcome Banner with pure-code interactive Clouds */}
            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#89adff] via-[#bcd3ff] to-[#e4eeff] p-6 sm:p-8 border border-white">
              <Clouds soft />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-[clamp(24px,3vw,34px)] font-bold text-[#0f1633] tracking-tight">
                    Welcome back, {user.name.split(' ')[0]}
                  </h1>
                  <p className="mt-1.5 text-[15px] text-[#26325f] max-w-xl">
                    {user.company} · {user.planName} ·{' '}
                    {user.packCreditsRemaining > 0
                      ? `${user.packCreditsRemaining} pack ${
                          user.packCreditsRemaining === 1 ? 'credit' : 'credits'
                        } ready to redeem`
                      : 'All briefs and 1080p renders in one studio'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link href="/order" className="btn lime">
                    <Plus className="w-4 h-4" />
                    <span>Order new video</span>
                  </Link>
                  <Link href="/account/orders" className="btn ghost">
                    <span>All videos</span>
                  </Link>
                </div>
              </div>
            </section>

            {/* 4-Column Tabular Metrics Strip */}
            <section aria-label="Account summary">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-5">
                  <div className="text-xs font-medium text-[#5a6483]">Total videos</div>
                  <div className="mt-2 text-3xl font-bold text-[#0f1633] tabular-nums">
                    {orders.length}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">Across all styles</div>
                </div>
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-5">
                  <div className="text-xs font-medium text-[#5a6483]">Ready to download</div>
                  <div className="mt-2 text-3xl font-bold text-[#0f1633] tabular-nums">
                    {readyCount}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">1080p MP4 masters</div>
                </div>
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-5">
                  <div className="text-xs font-medium text-[#5a6483]">In production</div>
                  <div className="mt-2 text-3xl font-bold text-[#0f1633] tabular-nums">
                    {activeCount}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">24-hour typical turnaround</div>
                </div>
                <div className="bg-white border border-[#e3e9f6] rounded-[20px] p-5">
                  <div className="text-xs font-medium text-[#5a6483]">Pack credits</div>
                  <div className="mt-2 text-3xl font-bold text-[#0f1633] tabular-nums">
                    {user.packCreditsRemaining}
                  </div>
                  <div className="mt-1 text-xs text-[#5a6483]">
                    {user.packCreditsRemaining > 0 ? 'Prepaid videos left' : 'Pay per order'}
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Videos & Brand Preset Split */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-6 items-start">
              <section className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e3e9f6] flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-[#0f1633]">Recent videos</h2>
                  <Link
                    href="/account/orders"
                    className="text-xs font-semibold text-[#4a43e8] hover:underline whitespace-nowrap"
                  >
                    View all ({orders.length})
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="p-10 text-center">
                    <Film className="w-8 h-8 text-[#5a6483] mx-auto" />
                    <h3 className="mt-3 text-base font-semibold text-[#0f1633]">
                      No videos ordered yet
                    </h3>
                    <p className="mt-1 text-sm text-[#5a6483]">
                      Pick a style and submit a short brief to start your first video.
                    </p>
                    <Link href="/order" className="btn lime mt-5">
                      Order your first video
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e3e9f6]">
                    {orders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f4f7fd]/60 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-sm shrink-0"
                              style={{ background: order.brandColor }}
                              aria-hidden="true"
                            />
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="text-[15px] font-semibold text-[#0f1633] hover:text-[#4a43e8] truncate"
                            >
                              {order.title}
                            </Link>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5a6483]">
                            <span className="font-mono-tabular">{order.id}</span>
                            <span aria-hidden="true">·</span>
                            <span>{STYLE_LABELS[order.style]}</span>
                            <span aria-hidden="true">·</span>
                            <span>{order.length}</span>
                            <span aria-hidden="true">·</span>
                            <span className={`font-semibold ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-[#5a6483] tabular-nums">
                            {order.editsTotal - order.editsUsed} edits left
                          </span>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f4f7fd] hover:bg-[#e9f1ff] text-xs font-semibold text-[#0f1633] transition-colors whitespace-nowrap"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Brand Kit & Quick Reorder */}
              <section className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#0f1633]">Brand defaults</h2>
                  <Link
                    href="/account/brand"
                    className="text-xs font-semibold text-[#4a43e8] hover:underline"
                  >
                    Edit
                  </Link>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-[#e3e9f6]">
                    <span className="text-[#5a6483]">Brand color</span>
                    <span className="inline-flex items-center gap-2 font-mono-tabular font-semibold text-[#0f1633]">
                      <span
                        className="w-4 h-4 rounded border border-[#e3e9f6]"
                        style={{ background: kit.primaryColor }}
                      />
                      {kit.primaryColor}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#e3e9f6]">
                    <span className="text-[#5a6483]">Preferred style</span>
                    <span className="font-semibold text-[#0f1633]">
                      {STYLE_LABELS[kit.defaultStyle]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#e3e9f6]">
                    <span className="text-[#5a6483]">Default length</span>
                    <span className="font-semibold text-[#0f1633]">{kit.defaultLength}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/order?style=${kit.defaultStyle}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#0f1633] text-white text-xs font-semibold hover:bg-[#1e2956] transition-colors"
                  >
                    <Palette className="w-3.5 h-3.5 text-[#d9f56b]" />
                    <span>Start {STYLE_LABELS[kit.defaultStyle]} order</span>
                  </Link>
                </div>
              </section>
            </div>

            {/* Studio Messages & Questions (Syncs live with /admin/inbox) */}
            <section
              className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-5"
              aria-label="Studio messages"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#0f1633]">Studio messages &amp; questions</h2>
                  <p className="text-xs text-[#5a6483] mt-0.5">
                    Questions sent here go straight to the Codereel Admin inbox, and replies appear
                    below.
                  </p>
                </div>
                <span className="text-xs font-mono-tabular text-[#5a6483]">
                  {inquiries.length} {inquiries.length === 1 ? 'thread' : 'threads'}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
                {/* Thread List */}
                <div className="space-y-3">
                  {inquiries.length === 0 ? (
                    <div className="rounded-[16px] bg-[#f4f7fd] border border-[#e3e9f6] p-6 text-center text-sm text-[#5a6483]">
                      <MessageSquare className="w-5 h-5 mx-auto mb-2 text-[#5a6483]" />
                      No messages yet. Ask about aspect ratios, exports, or custom briefs.
                    </div>
                  ) : (
                    inquiries.map((inq) => (
                      <article
                        key={inq.id}
                        className="rounded-[16px] border border-[#e3e9f6] bg-[#f4f7fd]/60 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-[#0f1633]">
                            {inq.subject}
                            {inq.orderId && (
                              <span className="ml-2 font-mono-tabular text-[#4a43e8]">
                                · {inq.orderId}
                              </span>
                            )}
                          </span>
                          <span
                            className={`font-semibold whitespace-nowrap ${
                              inq.status === 'Resolved' ? 'text-[#16a34a]' : 'text-[#d97706]'
                            }`}
                          >
                            {inq.status === 'Resolved' ? 'Replied' : 'Awaiting studio'}
                          </span>
                        </div>
                        <p className="text-xs text-[#5a6483] leading-relaxed">{inq.message}</p>
                        {inq.reply && (
                          <div className="mt-2 rounded-[12px] bg-white border border-[#e3e9f6] p-3 text-xs text-[#0f1633]">
                            <div className="font-semibold text-[#4a43e8] mb-0.5">
                              Codereel Studio reply
                            </div>
                            <p>{inq.reply}</p>
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </div>

                {/* Ask Studio Form */}
                <form
                  onSubmit={handleAskStudio}
                  className="rounded-[18px] border border-[#e3e9f6] bg-[#f4f7fd]/50 p-4 space-y-3"
                >
                  <div className="text-sm font-semibold text-[#0f1633]">Message studio</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="inq-subj" className="block text-xs font-semibold text-[#5a6483] mb-1">
                        Subject
                      </label>
                      <input
                        id="inq-subj"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Vertical 9:16 crop"
                        className="w-full rounded-[12px] border border-[#e3e9f6] bg-white px-3 py-2 text-sm text-[#0f1633]"
                      />
                    </div>
                    <div>
                      <label htmlFor="inq-ord" className="block text-xs font-semibold text-[#5a6483] mb-1">
                        Related order <span className="font-normal">(optional)</span>
                      </label>
                      <select
                        id="inq-ord"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full rounded-[12px] border border-[#e3e9f6] bg-white px-3 py-2 text-sm text-[#0f1633]"
                      >
                        <option value="">General question</option>
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.id} · {o.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="inq-msg" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Question
                    </label>
                    <textarea
                      id="inq-msg"
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about delivery timing, aspect ratio, or billing…"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-white px-3 py-2 text-sm text-[#0f1633]"
                    />
                  </div>
                  {inqError && <p className="text-xs font-medium text-[#a3173f]">{inqError}</p>}
                  {inqSent && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16a34a]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent to Codereel studio inbox
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button type="submit" className="btn dark">
                      <Send className="w-3.5 h-3.5" />
                      <span>Send question</span>
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        );
      }}
    </AccountShell>
  );
}

