'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, MessageSquare, RotateCcw, Search, Send } from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import { adminReplyInquiry } from '@/lib/mock-db';

const INQUIRY_SNIPPETS = [
  {
    label: '24-hour cut ETA',
    text: 'Confirmed — your cut is prioritized for 24-hour delivery and will appear in your account as soon as rendering finishes.',
  },
  {
    label: 'Safe margins applied',
    text: 'Added centered safe-margin guides so key text crops cleanly in both 16:9 landscape and 1:1 square previews.',
  },
  {
    label: 'Invoice archived',
    text: 'Your paid invoice receipt is archived under Billing & data in your account anytime you need it.',
  },
];

export default function AdminInboxPage() {
  const [filter, setFilter] = useState<'all' | 'Open' | 'Resolved'>('all');
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <AdminShell breadcrumb="Client inbox">
      {(db, refresh) => {
        const userMap = new Map(db.users.map((u) => [u.id, u]));
        const openCount = db.inquiries.filter((i) => i.status === 'Open').length;
        const q = query.trim().toLowerCase();

        const items = db.inquiries.filter((i) => {
          if (filter !== 'all' && i.status !== filter) return false;
          if (!q) return true;
          const client = userMap.get(i.userId);
          return `${i.id} ${i.subject} ${i.message} ${i.orderId ?? ''} ${client?.name ?? ''} ${
            client?.company ?? ''
          }`
            .toLowerCase()
            .includes(q);
        });

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  Client inbox &amp; questions
                </h1>
                <p className="mt-1 text-sm text-[#5a6483]">
                  Answer brief questions, aspect-ratio requests, and invoice follow-ups from
                  clients. Replies appear directly inside the client&rsquo;s account.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-[#5a6483] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search inquiries…"
                    aria-label="Search client inquiries"
                    className="w-full rounded-[12px] border border-[#e3e9f6] bg-white pl-9 pr-3 py-2 text-xs text-[#0f1633] placeholder:text-[#8691b0]"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-white border border-[#e3e9f6] rounded-[12px] shrink-0">
                  {(
                    [
                      ['all', `All (${db.inquiries.length})`],
                      ['Open', `Open (${openCount})`],
                      ['Resolved', `Resolved (${db.inquiries.length - openCount})`],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        filter === key
                          ? 'bg-[#0f1633] text-white'
                          : 'text-[#5a6483] hover:text-[#0f1633]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="bg-white border border-[#e3e9f6] rounded-[24px] p-12 text-center">
                <MessageSquare className="w-8 h-8 text-[#5a6483] mx-auto" />
                <h2 className="mt-3 text-base font-bold text-[#0f1633]">
                  No inquiries match this view
                </h2>
                <p className="mt-1 text-sm text-[#5a6483]">
                  Clear search or switch tabs to inspect all threads.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((inq) => {
                  const client = userMap.get(inq.userId);
                  const draft = drafts[inq.id] ?? inq.reply ?? '';
                  const err = errors[inq.id];

                  const handleSend = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (draft.trim().length < 4) {
                      setErrors((prev) => ({
                        ...prev,
                        [inq.id]: 'Write a short reply (at least 4 characters).',
                      }));
                      return;
                    }
                    setErrors((prev) => ({ ...prev, [inq.id]: '' }));
                    adminReplyInquiry(inq.id, draft, 'Resolved');
                    refresh();
                  };

                  return (
                    <article
                      key={inq.id}
                      className="bg-white border border-[#e3e9f6] rounded-[24px] p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5a6483]">
                            <span className="font-mono-tabular font-semibold text-[#0f1633]">
                              {inq.id}
                            </span>
                            <span aria-hidden="true">·</span>
                            <Link
                              href="/admin/clients"
                              className="font-semibold text-[#0f1633] hover:text-[#4a43e8]"
                            >
                              {client?.name ?? 'Unknown'} ({client?.company})
                            </Link>
                            {inq.orderId && (
                              <>
                                <span aria-hidden="true">·</span>
                                <Link
                                  href={`/admin/orders/${inq.orderId}`}
                                  className="font-mono-tabular font-semibold text-[#4a43e8] hover:underline"
                                >
                                  Order {inq.orderId}
                                </Link>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">{inq.createdAt}</span>
                          </div>
                          <h2 className="mt-1.5 text-lg font-bold text-[#0f1633]">{inq.subject}</h2>
                        </div>

                        <div className="shrink-0 text-xs font-semibold">
                          {inq.status === 'Open' ? (
                            <span className="text-[#d97706]">Open · Needs reply</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#16a34a]">
                              <Check className="w-3.5 h-3.5" /> Resolved
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="rounded-[16px] bg-[#f4f7fd] border border-[#e3e9f6] p-4 text-sm text-[#0f1633]">
                        {inq.message}
                      </p>

                      {inq.status === 'Resolved' && inq.reply ? (
                        <div className="rounded-[16px] bg-white border border-[#e3e9f6] p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-[#5a6483]">
                            <span className="font-semibold text-[#0f1633]">Studio reply</span>
                            <button
                              type="button"
                              onClick={() => {
                                adminReplyInquiry(inq.id, inq.reply, 'Open');
                                refresh();
                              }}
                              className="inline-flex items-center gap-1 font-semibold text-[#4a43e8] hover:underline cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reopen to edit</span>
                            </button>
                          </div>
                          <p className="text-sm text-[#0f1633]">{inq.reply}</p>
                        </div>
                      ) : (
                        <form onSubmit={handleSend} className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor={`reply-${inq.id}`}
                              className="block text-xs font-semibold text-[#5a6483]"
                            >
                              Reply as Codereel Studio
                            </label>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {INQUIRY_SNIPPETS.map((s) => (
                                <button
                                  key={s.label}
                                  type="button"
                                  onClick={() => {
                                    setDrafts((prev) => ({ ...prev, [inq.id]: s.text }));
                                    setErrors((prev) => ({ ...prev, [inq.id]: '' }));
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-[#f4f7fd] hover:bg-[#e9f1ff] border border-[#e3e9f6] text-[11px] font-semibold text-[#4a43e8] cursor-pointer"
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            id={`reply-${inq.id}`}
                            rows={2}
                            value={draft}
                            onChange={(e) =>
                              setDrafts((prev) => ({ ...prev, [inq.id]: e.target.value }))
                            }
                            placeholder="Write your reply to the client…"
                            className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
                          />
                          {err && <p className="text-xs font-medium text-[#a3173f]">{err}</p>}
                          <div className="flex justify-end">
                            <button type="submit" className="btn lime">
                              <Send className="w-3.5 h-3.5" />
                              <span>Send reply &amp; mark Resolved</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        );
      }}
    </AdminShell>
  );
}

