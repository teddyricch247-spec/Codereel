'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, Download, MessageSquare, Send, Sparkles } from 'lucide-react';
import AccountShell from '@/components/AccountShell';
import VideoPreviewPlayer from '@/components/VideoPreviewPlayer';
import {
  createClientInquiry,
  getOrderById,
  getUserInquiries,
  markOrderReadyDemo,
  STYLE_LABELS,
  submitEditRequest,
} from '@/lib/mock-db';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? '';

  const [timecode, setTimecode] = useState('0:08');
  const [editNote, setEditNote] = useState('');
  const [formError, setFormError] = useState('');
  const [downloadNotice, setDownloadNotice] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  const handleDownloadMock = (title: string, id: string, brandColor: string) => {
    const svgPoster = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#10162f"/>
  <rect x="48" y="48" width="1184" height="624" rx="28" fill="${brandColor}" fill-opacity="0.24" stroke="${brandColor}" stroke-width="3"/>
  <text x="96" y="140" fill="#d9f56b" font-family="sans-serif" font-size="24" font-weight="700">CODEREEL PROTOTYPE EXPORT · ${id}</text>
  <text x="96" y="340" fill="#ffffff" font-family="sans-serif" font-size="64" font-weight="800">${title.replace(/[<>&"]/g, '')}</text>
  <text x="96" y="410" fill="#c9d4ff" font-family="sans-serif" font-size="26">1080p MP4 placeholder frame generated locally in prototype mode.</text>
</svg>`;
    const blob = new Blob([svgPoster], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id.toLowerCase()}-1080p-prototype-frame.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDownloadNotice(`Prototype export downloaded (${id}-1080p-prototype-frame.svg).`);
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  return (
    <AccountShell breadcrumb={`Video · ${orderId}`}>
      {(user, refresh) => {
        const order = getOrderById(orderId);

        if (!order) {
          return (
            <div className="bg-white border border-[#e3e9f6] rounded-[24px] p-10 text-center">
              <h1 className="text-xl font-bold text-[#0f1633]">Order not found</h1>
              <p className="mt-2 text-sm text-[#5a6483]">
                We couldn’t find {orderId} in the current prototype session.
              </p>
              <Link href="/account/orders" className="btn dark mt-5">
                Back to my videos
              </Link>
            </div>
          );
        }

        const editsRemaining = Math.max(0, order.editsTotal - order.editsUsed);

        const handleSubmitEdit = (e: React.FormEvent) => {
          e.preventDefault();
          setFormError('');
          if (editNote.trim().length < 5) {
            setFormError('Describe the change you want (at least 5 characters).');
            return;
          }
          submitEditRequest(order.id, user.name, timecode, editNote);
          setEditNote('');
          refresh();
        };

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link
                  href="/account/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6483] hover:text-[#0f1633] mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to my videos</span>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  {order.title}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#5a6483]">
                  <span className="font-mono-tabular font-semibold text-[#0f1633]">{order.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>{STYLE_LABELS[order.style]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{order.length}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#4a43e8]">{order.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {(order.status === 'Rendering first cut' ||
                  order.status === 'Edit round in progress') && (
                  <button
                    type="button"
                    onClick={() => {
                      markOrderReadyDemo(order.id);
                      refresh();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#e3e9f6] bg-white hover:bg-[#f4f7fd] text-xs font-semibold text-[#0f1633] cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#4a43e8]" />
                    <span>Simulate studio delivery</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDownloadMock(order.title, order.id, order.brandColor)}
                  className="btn lime"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 1080p MP4</span>
                </button>
              </div>
            </div>

            {downloadNotice && (
              <div className="rounded-[16px] bg-white border border-[#e3e9f6] px-4 py-3 text-sm font-medium text-[#0f1633] flex items-center gap-2">
                <Check className="w-4 h-4 text-[#16a34a]" />
                <span>{downloadNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-start">
              {/* Left: Player + Edit Rounds */}
              <div className="space-y-6">
                <VideoPreviewPlayer order={order} />

                <section className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#0f1633]">Edit rounds & notes</h2>
                    <span className="text-xs font-semibold text-[#5a6483] tabular-nums">
                      {editsRemaining} of {order.editsTotal} edit rounds remaining
                    </span>
                  </div>

                  {/* Revision History */}
                  <div className="space-y-3">
                    {order.revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className={`rounded-[16px] p-4 border ${
                          rev.role === 'client'
                            ? 'bg-[#f4f7fd] border-[#e3e9f6]'
                            : 'bg-white border-[#e3e9f6]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-[#5a6483]">
                          <span className="font-semibold text-[#0f1633]">{rev.author}</span>
                          <span className="font-mono-tabular">
                            @{rev.timecode} · {rev.timestamp}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-[#0f1633]">{rev.note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Request Edit Form */}
                  {editsRemaining > 0 ? (
                    <form onSubmit={handleSubmitEdit} className="pt-4 border-t border-[#e3e9f6] space-y-3">
                      <div className="text-sm font-semibold text-[#0f1633]">
                        Request an edit round
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                        <div>
                          <label htmlFor="rev-tc" className="block text-xs font-semibold text-[#5a6483] mb-1">
                            Timecode
                          </label>
                          <input
                            id="rev-tc"
                            type="text"
                            value={timecode}
                            onChange={(e) => setTimecode(e.target.value)}
                            placeholder="0:12"
                            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
                          />
                        </div>
                        <div>
                          <label htmlFor="rev-note" className="block text-xs font-semibold text-[#5a6483] mb-1">
                            What should change?
                          </label>
                          <input
                            id="rev-note"
                            type="text"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="e.g. Hold the final headline 1 second longer"
                            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm text-[#0f1633]"
                          />
                        </div>
                      </div>
                      {formError && (
                        <p className="text-xs font-medium text-[#a3173f]">{formError}</p>
                      )}
                      <div className="flex justify-end">
                        <button type="submit" className="btn dark">
                          <Send className="w-3.5 h-3.5" />
                          <span>Send edit note</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="pt-3 border-t border-[#e3e9f6] text-xs text-[#5a6483]">
                      All included edit rounds for this order have been used. Need a fresh cut?{' '}
                      <Link href={`/order?style=${order.style}`} className="font-semibold text-[#4a43e8] hover:underline">
                        Reorder with this style
                      </Link>
                      .
                    </div>
                  )}
                </section>
              </div>

              {/* Right: Brief & Specs + Order Questions */}
              <div className="space-y-6">
                <aside className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-5">
                  <h2 className="text-lg font-bold text-[#0f1633]">Order brief</h2>

                  <dl className="divide-y divide-[#e3e9f6] text-sm">
                    <div className="py-2.5 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Style</dt>
                      <dd className="font-semibold text-[#0f1633]">{STYLE_LABELS[order.style]}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Length</dt>
                      <dd className="font-semibold text-[#0f1633]">{order.length}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Brand color</dt>
                      <dd className="inline-flex items-center gap-2 font-mono-tabular font-semibold text-[#0f1633]">
                        <span
                          className="w-4 h-4 rounded border border-[#e3e9f6]"
                          style={{ background: order.brandColor }}
                        />
                        {order.brandColor}
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Format</dt>
                      <dd className="font-semibold text-[#0f1633] tabular-nums">
                        {order.resolution} ({order.fileSize})
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Ordered</dt>
                      <dd className="font-mono-tabular text-[#0f1633]">{order.createdAt}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">
                        {order.deliveredAt ? 'Delivered' : 'Target cut'}
                      </dt>
                      <dd className="font-mono-tabular text-[#0f1633]">
                        {order.deliveredAt || order.etaDate}
                      </dd>
                    </div>
                  </dl>

                  <div className="space-y-3 pt-2 border-t border-[#e3e9f6]">
                    <div>
                      <div className="text-xs font-semibold text-[#5a6483]">Goal</div>
                      <p className="mt-1 text-sm text-[#0f1633]">{order.goal}</p>
                    </div>
                    {order.notes && (
                      <div>
                        <div className="text-xs font-semibold text-[#5a6483]">Script / notes</div>
                        <p className="mt-1 text-sm text-[#5a6483]">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/order?style=${order.style}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-[#e3e9f6] hover:bg-[#f4f7fd] text-xs font-semibold text-[#0f1633] transition-colors"
                  >
                    Reorder similar video
                  </Link>
                </aside>

                <aside className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#4a43e8]" />
                    <h2 className="text-base font-bold text-[#0f1633]">Question for studio</h2>
                  </div>
                  {getUserInquiries(user.id)
                    .filter((i) => i.orderId === order.id)
                    .map((inq) => (
                      <div
                        key={inq.id}
                        className="rounded-[14px] bg-[#f4f7fd] border border-[#e3e9f6] p-3 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between gap-2 font-semibold text-[#0f1633]">
                          <span>{inq.subject}</span>
                          <span
                            className={
                              inq.status === 'Resolved' ? 'text-[#16a34a]' : 'text-[#d97706]'
                            }
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-[#5a6483]">{inq.message}</p>
                        {inq.reply && (
                          <p className="pt-1.5 border-t border-[#e3e9f6] text-[#0f1633]">
                            <b className="text-[#4a43e8]">Studio:</b> {inq.reply}
                          </p>
                        )}
                      </div>
                    ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (questionText.trim().length < 5) return;
                      createClientInquiry({
                        userId: user.id,
                        orderId: order.id,
                        subject: `Question on ${order.id}`,
                        message: questionText,
                      });
                      setQuestionText('');
                      setQuestionSent(true);
                      refresh();
                      setTimeout(() => setQuestionSent(false), 3000);
                    }}
                    className="space-y-2.5"
                  >
                    <label htmlFor="ord-q" className="sr-only">
                      Question about this order
                    </label>
                    <textarea
                      id="ord-q"
                      rows={2}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Ask about crop ratios, format, or turnaround…"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs text-[#0f1633]"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#16a34a] font-semibold">
                        {questionSent ? 'Sent to admin inbox' : ''}
                      </span>
                      <button
                        type="submit"
                        disabled={questionText.trim().length < 5}
                        className="px-3.5 py-1.5 rounded-full bg-[#0f1633] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                      >
                        Send question
                      </button>
                    </div>
                  </form>
                </aside>
              </div>
            </div>
          </div>
        );
      }}
    </AccountShell>
  );
}
