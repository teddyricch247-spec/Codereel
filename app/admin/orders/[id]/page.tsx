'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Send, Trash2 } from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import VideoPreviewPlayer from '@/components/VideoPreviewPlayer';
import {
  adminDeleteOrder,
  adminPostStudioReply,
  adminUpdateOrder,
  getOrderById,
  loginAsDemoUser,
  STYLE_LABELS,
  type OrderStatus,
} from '@/lib/mock-db';

const STATUS_OPTIONS: OrderStatus[] = [
  'Rendering first cut',
  'Edit round in progress',
  'Ready to download',
  'Delivered',
];

const PRODUCER_OPTIONS = ['Unassigned', 'Samira Chen', 'Marcus Bell'];

const REPLY_PRESETS = [
  {
    label: 'First cut uploaded',
    tc: '0:00',
    text: 'First cut rendered at 60fps and ready for your review. Let us know if any timing tweaks are needed.',
  },
  {
    label: 'Applied timing tweak',
    tc: '0:12',
    text: 'Applied your timing adjustment and tightened the scene transition. Fresh MP4 ready to download.',
  },
  {
    label: 'Final master delivered',
    tc: '0:00',
    text: 'Final master exported and archived in your account. Ready for launch!',
  },
];

function OrderProductionForm({
  order,
  onSaved,
  onDeleted,
}: {
  order: NonNullable<ReturnType<typeof getOrderById>>;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(order.title);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [priority, setPriority] = useState<'Priority' | 'Standard'>(
    order.priority ?? 'Standard'
  );
  const [assignedProducer, setAssignedProducer] = useState(
    order.assignedProducer ?? 'Unassigned'
  );
  const [resolution, setResolution] = useState(order.resolution);
  const [editsTotal, setEditsTotal] = useState(order.editsTotal);
  const [etaDate, setEtaDate] = useState(order.etaDate);
  const [fileSize, setFileSize] = useState(order.fileSize);
  const [internalNote, setInternalNote] = useState(order.internalNote ?? '');
  const [savedBanner, setSavedBanner] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateOrder(order.id, {
      title: title.trim() || order.title,
      status,
      priority,
      assignedProducer,
      resolution,
      editsTotal: Math.max(order.editsUsed, editsTotal),
      etaDate,
      fileSize,
      internalNote,
    });
    onSaved();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[#0f1633]">Production controls</h2>
        {savedBanner && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16a34a]">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <div>
        <label htmlFor="adm-title" className="block text-xs font-semibold text-[#5a6483] mb-1">
          Order title
        </label>
        <input
          id="adm-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-sm font-semibold text-[#0f1633]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="adm-status" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Status
          </label>
          <select
            id="adm-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-medium text-[#0f1633]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="adm-priority" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Priority
          </label>
          <select
            id="adm-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'Priority' | 'Standard')}
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-medium text-[#0f1633]"
          >
            <option value="Priority">Priority</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="adm-producer" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Assigned producer
          </label>
          <select
            id="adm-producer"
            value={assignedProducer}
            onChange={(e) => setAssignedProducer(e.target.value)}
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-medium text-[#0f1633]"
          >
            {PRODUCER_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="adm-res" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Export format
          </label>
          <select
            id="adm-res"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-medium text-[#0f1633]"
          >
            <option value="1080p MP4">1080p MP4</option>
            <option value="4K MP4">4K MP4</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="adm-eta" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Target ETA
          </label>
          <input
            id="adm-eta"
            type="text"
            value={etaDate}
            onChange={(e) => setEtaDate(e.target.value)}
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>
        <div>
          <label htmlFor="adm-size" className="block text-xs font-semibold text-[#5a6483] mb-1">
            File size
          </label>
          <input
            id="adm-size"
            type="text"
            value={fileSize}
            onChange={(e) => setFileSize(e.target.value)}
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>
        <div>
          <label htmlFor="adm-edits" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Edit rounds ({order.editsUsed} used)
          </label>
          <input
            id="adm-edits"
            type="number"
            min={order.editsUsed}
            max={10}
            value={editsTotal}
            onChange={(e) =>
              setEditsTotal(Math.max(order.editsUsed, Number(e.target.value) || order.editsUsed))
            }
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="adm-internal" className="block text-xs font-semibold text-[#5a6483] mb-1">
          Internal studio note
        </label>
        <textarea
          id="adm-internal"
          rows={3}
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder="Producer handoff notes (hidden from client)"
          className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm text-[#0f1633]"
        />
      </div>

      <button type="submit" className="btn dark w-full justify-center">
        Save production settings
      </button>

      <div className="pt-3 border-t border-[#e3e9f6] flex items-center justify-between gap-3">
        {confirmDelete ? (
          <>
            <span className="text-xs font-semibold text-[#a3173f]">
              Remove {order.id} from mock DB?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-semibold text-[#5a6483] hover:text-[#0f1633] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  adminDeleteOrder(order.id);
                  onDeleted();
                }}
                className="px-3 py-1.5 rounded-full bg-[#a3173f] text-white text-xs font-semibold cursor-pointer"
              >
                Confirm delete
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a3173f] hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete prototype order</span>
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id ?? '';

  const [timecode, setTimecode] = useState('0:00');
  const [replyText, setReplyText] = useState('');
  const [markReady, setMarkReady] = useState(true);
  const [replyErr, setReplyErr] = useState('');

  return (
    <AdminShell breadcrumb={`Order · ${orderId}`}>
      {(db, refresh) => {
        const order = getOrderById(orderId);
        if (!order) {
          return (
            <div className="bg-white border border-[#e3e9f6] rounded-[24px] p-10 text-center">
              <h1 className="text-xl font-bold text-[#0f1633]">Order not found</h1>
              <p className="mt-2 text-sm text-[#5a6483]">
                Order {orderId} does not exist in the local mock database.
              </p>
              <Link href="/admin/orders" className="btn dark mt-5">
                Back to order queue
              </Link>
            </div>
          );
        }

        const client = db.users.find((u) => u.id === order.userId);

        const handleStudioReply = (e: React.FormEvent) => {
          e.preventDefault();
          setReplyErr('');
          if (replyText.trim().length < 4) {
            setReplyErr('Enter a reply note for the client (at least 4 characters).');
            return;
          }
          adminPostStudioReply(order.id, timecode, replyText, markReady);
          setReplyText('');
          refresh();
        };

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a6483] hover:text-[#0f1633] mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to order queue</span>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  {order.title}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#5a6483]">
                  <span className="font-mono-tabular font-semibold text-[#0f1633]">{order.id}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {client?.name ?? 'Unknown'} ({client?.company})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{STYLE_LABELS[order.style]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#4a43e8]">{order.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (client) loginAsDemoUser(client.email);
                    router.push(`/account/orders/${order.id}`);
                  }}
                  className="px-4 py-2.5 rounded-full border border-[#e3e9f6] bg-white hover:bg-[#e9f1ff] text-xs font-semibold text-[#0f1633] whitespace-nowrap cursor-pointer"
                >
                  Preview as {client?.name.split(' ')[0] ?? 'client'}
                </button>
                {order.status !== 'Ready to download' && (
                  <button
                    type="button"
                    onClick={() => {
                      adminPostStudioReply(
                        order.id,
                        '0:00',
                        `New ${order.resolution} render uploaded from studio console. Ready for download.`,
                        true
                      );
                      refresh();
                    }}
                    className="btn lime"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Ready to download</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-start">
              {/* Left: Player + Revision Thread + Studio Reply */}
              <div className="space-y-6">
                <VideoPreviewPlayer order={order} />

                <section className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#0f1633]">
                      Client thread &amp; studio delivery
                    </h2>
                    <span className="text-xs font-mono-tabular text-[#5a6483]">
                      {order.editsUsed}/{order.editsTotal} edit rounds used
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className={`rounded-[16px] p-4 border ${
                          rev.role === 'client'
                            ? 'bg-[#fff9eb] border-[#f3deb3]'
                            : 'bg-[#f4f7fd] border-[#e3e9f6]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-[#5a6483]">
                          <span className="font-semibold text-[#0f1633]">
                            {rev.author}{' '}
                            <span className="font-normal text-[#5a6483]">
                              ({rev.role === 'client' ? 'Client request' : 'Studio update'})
                            </span>
                          </span>
                          <span className="font-mono-tabular">
                            @{rev.timecode} · {rev.timestamp}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-[#0f1633]">{rev.note}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleStudioReply}
                    className="pt-4 border-t border-[#e3e9f6] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#0f1633]">
                        Post reply as Codereel Studio
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {REPLY_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setTimecode(preset.tc);
                              setReplyText(preset.text);
                              setReplyErr('');
                            }}
                            className="px-2.5 py-1 rounded-full bg-[#f4f7fd] hover:bg-[#e9f1ff] border border-[#e3e9f6] text-[11px] font-semibold text-[#4a43e8] cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                      <div>
                        <label
                          htmlFor="adm-tc"
                          className="block text-xs font-semibold text-[#5a6483] mb-1"
                        >
                          Timecode
                        </label>
                        <input
                          id="adm-tc"
                          type="text"
                          value={timecode}
                          onChange={(e) => setTimecode(e.target.value)}
                          placeholder="0:12"
                          className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="adm-reply"
                          className="block text-xs font-semibold text-[#5a6483] mb-1"
                        >
                          Message to client
                        </label>
                        <input
                          id="adm-reply"
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="e.g. Sped up row checkmarks by 20% and exported v2 at 1080p."
                          className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2.5 text-sm text-[#0f1633]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0f1633] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={markReady}
                          onChange={(e) => setMarkReady(e.target.checked)}
                          className="w-4 h-4 accent-[#4a43e8]"
                        />
                        <span>Deliver cut &amp; set status to Ready to download</span>
                      </label>
                      <button type="submit" className="btn lime">
                        <Send className="w-3.5 h-3.5" />
                        <span>Send studio reply</span>
                      </button>
                    </div>
                    {replyErr && <p className="text-xs font-medium text-[#a3173f]">{replyErr}</p>}
                  </form>
                </section>
              </div>

              {/* Right: Production Controls & Client Brief */}
              <div className="space-y-6">
                <OrderProductionForm
                  key={`${order.id}:${order.title}:${order.status}:${order.assignedProducer ?? ''}:${order.etaDate}:${order.editsTotal}:${order.resolution}`}
                  order={order}
                  onSaved={refresh}
                  onDeleted={() => router.push('/admin/orders')}
                />

                <aside className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#0f1633]">Client brief</h2>
                    <Link
                      href="/admin/clients"
                      className="text-xs font-semibold text-[#4a43e8] hover:underline"
                    >
                      View client
                    </Link>
                  </div>
                  <dl className="divide-y divide-[#e3e9f6] text-sm">
                    <div className="py-2 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Client</dt>
                      <dd className="font-semibold text-[#0f1633] text-right">
                        {client?.name ?? 'Unknown'}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Email</dt>
                      <dd className="font-mono-tabular text-xs text-[#0f1633] text-right">
                        {client?.email ?? '—'}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <dt className="text-[#5a6483]">Brand color</dt>
                      <dd className="inline-flex items-center gap-2 font-mono-tabular font-semibold text-[#0f1633]">
                        <span
                          className="w-4 h-4 rounded border border-[#e3e9f6]"
                          style={{ background: order.brandColor }}
                        />
                        {order.brandColor}
                      </dd>
                    </div>
                  </dl>
                  <div className="space-y-2.5 pt-2 border-t border-[#e3e9f6]">
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
                </aside>
              </div>
            </div>
          </div>
        );
      }}
    </AdminShell>
  );
}

