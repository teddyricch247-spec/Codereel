'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Minus,
  Plus,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import {
  adminCreateClient,
  adminUpdateClient,
  adminUpdateClientBrandKit,
  getUserBrandKit,
  loginAsDemoUser,
  type BrandKit,
  type VideoStyle,
} from '@/lib/mock-db';

const PLAN_OPTIONS = ['Starter', 'Single', 'Pack of 3', 'Long form'];

function AdminBrandKitEditor({
  userId,
  initialKit,
  onSaved,
}: {
  userId: string;
  initialKit: BrandKit;
  onSaved: () => void;
}) {
  const [kit, setKit] = useState<BrandKit>(initialKit);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateClientBrandKit(userId, kit);
    onSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-[#0f1633]">Brand kit &amp; defaults (editable)</div>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16a34a]">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-[#5a6483] mb-1">
            Company name
          </label>
          <input
            type="text"
            value={kit.companyName}
            onChange={(e) => setKit({ ...kit, companyName: e.target.value })}
            className="w-full rounded-[10px] border border-[#e3e9f6] bg-white px-2.5 py-1.5 text-xs text-[#0f1633]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#5a6483] mb-1">
            Default style
          </label>
          <select
            value={kit.defaultStyle}
            onChange={(e) => setKit({ ...kit, defaultStyle: e.target.value as VideoStyle })}
            className="w-full rounded-[10px] border border-[#e3e9f6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0f1633]"
          >
            <option value="kinetic">Kinetic type</option>
            <option value="demo">Product demo</option>
            <option value="data">Data story</option>
            <option value="code">Code explainer</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#5a6483] mb-1">
            Primary hex
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              aria-label="Client brand primary color"
              value={/^#[0-9a-f]{6}$/i.test(kit.primaryColor) ? kit.primaryColor : '#4a43e8'}
              onChange={(e) => setKit({ ...kit, primaryColor: e.target.value })}
              className="w-7 h-7 rounded border border-[#e3e9f6] cursor-pointer"
            />
            <input
              type="text"
              value={kit.primaryColor}
              onChange={(e) => setKit({ ...kit, primaryColor: e.target.value })}
              className="w-full rounded-[10px] border border-[#e3e9f6] bg-white px-2.5 py-1.5 text-xs font-mono-tabular text-[#0f1633]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-[#5a6483] mb-1">
          Creative tone notes
        </label>
        <input
          type="text"
          value={kit.toneNotes}
          onChange={(e) => setKit({ ...kit, toneNotes: e.target.value })}
          className="w-full rounded-[10px] border border-[#e3e9f6] bg-white px-2.5 py-1.5 text-xs text-[#0f1633]"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-full bg-[#0f1633] text-white text-xs font-semibold hover:bg-[#1e2956] cursor-pointer"
        >
          Save brand kit
        </button>
      </div>
    </form>
  );
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPlan, setNewPlan] = useState('Pack of 3');
  const [newCredits, setNewCredits] = useState(2);
  const [addErr, setAddErr] = useState('');

  return (
    <AdminShell breadcrumb="Clients">
      {(db, refresh) => {
        const q = query.trim().toLowerCase();
        const filteredUsers = db.users.filter((u) => {
          if (!q) return true;
          return `${u.name} ${u.company} ${u.email} ${u.planName}`.toLowerCase().includes(q);
        });

        const handleCreateClient = (e: React.FormEvent) => {
          e.preventDefault();
          setAddErr('');
          if (newName.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(newEmail.trim())) {
            setAddErr('Enter a valid name and email address.');
            return;
          }
          const created = adminCreateClient({
            name: newName,
            email: newEmail,
            company: newCompany || 'New Workspace',
            planName: newPlan,
            packCreditsRemaining: newCredits,
          });
          setNewName('');
          setNewEmail('');
          setNewCompany('');
          setShowAddClient(false);
          setExpandedUserId(created.id);
          refresh();
        };

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  Client directory &amp; credits
                </h1>
                <p className="mt-1 text-sm text-[#5a6483]">
                  Inspect client accounts, adjust pack credits, edit brand kits, or open their
                  client studio session.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#5a6483] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search client, company, email…"
                    aria-label="Search clients"
                    className="w-full rounded-[14px] border border-[#e3e9f6] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#0f1633] placeholder:text-[#8691b0]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddClient((v) => !v)}
                  className="btn lime"
                >
                  {showAddClient ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Close</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Add client</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {showAddClient && (
              <form
                onSubmit={handleCreateClient}
                className="bg-white border border-[#e3e9f6] rounded-[24px] p-5 sm:p-6 space-y-4"
              >
                <h2 className="text-base font-bold text-[#0f1633]">Add prototype client account</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label htmlFor="ac-name" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Full name
                    </label>
                    <input
                      id="ac-name"
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Jordan Lee"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs text-[#0f1633]"
                    />
                  </div>
                  <div>
                    <label htmlFor="ac-email" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Email
                    </label>
                    <input
                      id="ac-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="jordan@vanguard.ai"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs text-[#0f1633]"
                    />
                  </div>
                  <div>
                    <label htmlFor="ac-comp" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Company
                    </label>
                    <input
                      id="ac-comp"
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="Vanguard AI"
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs text-[#0f1633]"
                    />
                  </div>
                  <div>
                    <label htmlFor="ac-plan" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Plan tier
                    </label>
                    <select
                      id="ac-plan"
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs font-semibold text-[#0f1633]"
                    >
                      {PLAN_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ac-cred" className="block text-xs font-semibold text-[#5a6483] mb-1">
                      Pack credits
                    </label>
                    <input
                      id="ac-cred"
                      type="number"
                      min={0}
                      max={20}
                      value={newCredits}
                      onChange={(e) => setNewCredits(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3 py-2 text-xs font-mono-tabular text-[#0f1633]"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#a3173f]">{addErr}</span>
                  <button type="submit" className="btn dark">
                    Create client
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#5a6483]">
                  No clients match &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e9f6] text-[12px] font-semibold text-[#5a6483] bg-[#f4f7fd]/70">
                        <th className="py-3 px-6">Client</th>
                        <th className="py-3 px-4">Plan tier</th>
                        <th className="py-3 px-4 text-right">Orders</th>
                        <th className="py-3 px-4 text-right">Mock spend</th>
                        <th className="py-3 px-4">Pack credits</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e9f6] text-sm">
                      {filteredUsers.map((client) => {
                        const orders = db.orders.filter((o) => o.userId === client.id);
                        const inquiries = db.inquiries.filter((i) => i.userId === client.id);
                        const receipts = db.receipts.filter((r) => r.userId === client.id);
                        const spend = receipts
                          .filter((r) => r.status.toLowerCase() === 'paid')
                          .reduce((sum, r) => sum + r.amount, 0);
                        const kit = getUserBrandKit(client.id);
                        const isOpen = expandedUserId === client.id;

                        return (
                          <Fragment key={client.id}>
                            <tr className="hover:bg-[#f4f7fd]/40 transition-colors">
                              <td className="py-3.5 px-6">
                                <div className="font-semibold text-[#0f1633]">{client.name}</div>
                                <div className="text-xs text-[#5a6483]">
                                  {client.company} ·{' '}
                                  <span className="font-mono-tabular">{client.email}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <select
                                  aria-label={`Plan tier for ${client.name}`}
                                  value={client.planName}
                                  onChange={(e) => {
                                    adminUpdateClient(client.id, { planName: e.target.value });
                                    refresh();
                                  }}
                                  className="rounded-[10px] border border-[#e3e9f6] bg-[#f4f7fd] px-2.5 py-1.5 text-xs font-semibold text-[#0f1633]"
                                >
                                  {PLAN_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono-tabular text-[#0f1633]">
                                {orders.length}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-[#0f1633]">
                                ${spend.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    aria-label={`Remove pack credit from ${client.name}`}
                                    disabled={client.packCreditsRemaining <= 0}
                                    onClick={() => {
                                      adminUpdateClient(client.id, {
                                        packCreditsRemaining: Math.max(
                                          0,
                                          client.packCreditsRemaining - 1
                                        ),
                                      });
                                      refresh();
                                    }}
                                    className="w-7 h-7 rounded-full border border-[#e3e9f6] bg-white hover:bg-[#f4f7fd] disabled:opacity-40 inline-grid place-items-center cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5 text-[#0f1633]" />
                                  </button>
                                  <span className="w-6 text-center font-mono-tabular font-bold text-[#0f1633]">
                                    {client.packCreditsRemaining}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Add pack credit to ${client.name}`}
                                    onClick={() => {
                                      adminUpdateClient(client.id, {
                                        packCreditsRemaining: client.packCreditsRemaining + 1,
                                      });
                                      refresh();
                                    }}
                                    className="w-7 h-7 rounded-full border border-[#e3e9f6] bg-white hover:bg-[#f4f7fd] inline-grid place-items-center cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-[#0f1633]" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-3.5 px-6 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      loginAsDemoUser(client.email);
                                      router.push('/account');
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#e3e9f6] bg-white hover:bg-[#e9f1ff] text-xs font-semibold text-[#4a43e8] cursor-pointer whitespace-nowrap"
                                  >
                                    <span>Open studio</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() =>
                                      setExpandedUserId(isOpen ? null : client.id)
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f4f7fd] hover:bg-[#e9f1ff] text-xs font-semibold text-[#0f1633] cursor-pointer whitespace-nowrap"
                                  >
                                    <span>{isOpen ? 'Hide' : 'Inspect'}</span>
                                    {isOpen ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {isOpen && (
                              <tr className="bg-[#f4f7fd]/60">
                                <td colSpan={6} className="px-6 py-5">
                                  <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 text-xs">
                                    <AdminBrandKitEditor
                                      key={`${client.id}:${kit.companyName}:${kit.primaryColor}:${kit.defaultStyle}`}
                                      userId={client.id}
                                      initialKit={kit}
                                      onSaved={refresh}
                                    />

                                    <div className="space-y-4">
                                      <div>
                                        <div className="font-semibold text-[#5a6483]">
                                          Orders ({orders.length})
                                        </div>
                                        {orders.length === 0 ? (
                                          <p className="mt-1 text-[#5a6483]">No orders yet.</p>
                                        ) : (
                                          <div className="mt-1.5 flex flex-wrap gap-2">
                                            {orders.map((o) => (
                                              <Link
                                                key={o.id}
                                                href={`/admin/orders/${o.id}`}
                                                className="font-mono-tabular font-semibold text-[#4a43e8] hover:underline"
                                              >
                                                {o.id} ({o.status})
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <div className="font-semibold text-[#5a6483]">
                                          Receipts ({receipts.length}) &amp; Inquiries ({inquiries.length})
                                        </div>
                                        <div className="mt-1.5 space-y-1 text-[#0f1633]">
                                          {receipts.slice(0, 3).map((r) => (
                                            <div key={r.id} className="flex justify-between gap-2 font-mono-tabular">
                                              <span>{r.id}</span>
                                              <span>
                                                ${r.amount} · {r.status}
                                              </span>
                                            </div>
                                          ))}
                                          {inquiries.slice(0, 2).map((inq) => (
                                            <div key={inq.id} className="flex justify-between gap-2 text-[#5a6483]">
                                              <span className="truncate">{inq.subject}</span>
                                              <Link
                                                href="/admin/inbox"
                                                className="font-semibold text-[#4a43e8] hover:underline shrink-0"
                                              >
                                                {inq.status} →
                                              </Link>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
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

