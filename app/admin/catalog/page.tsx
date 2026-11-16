'use client';

import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import {
  adminUpdateCatalogConfig,
  adminUpdateReceiptStatus,
  resetMockDb,
  type CatalogConfig,
} from '@/lib/mock-db';

function CatalogSettingsForm({
  initialConfig,
  onSaved,
}: {
  initialConfig: CatalogConfig;
  onSaved: () => void;
}) {
  const [config, setConfig] = useState<CatalogConfig>(initialConfig);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateCatalogConfig(config);
    onSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f1633]">Plan pricing &amp; turnaround SLA</h2>
          <p className="text-xs text-[#5a6483] mt-0.5">
            Synced live with /pricing and /order via local mock storage.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16a34a]">
            <Check className="w-3.5 h-3.5" /> Saved &amp; synced
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="cfg-single" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Single video ($)
          </label>
          <input
            id="cfg-single"
            type="number"
            min={1}
            value={config.singlePrice}
            onChange={(e) =>
              setConfig({ ...config, singlePrice: Math.max(1, Number(e.target.value) || 0) })
            }
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>

        <div>
          <label htmlFor="cfg-pack" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Pack of 3 ($)
          </label>
          <input
            id="cfg-pack"
            type="number"
            min={1}
            value={config.packPrice}
            onChange={(e) =>
              setConfig({ ...config, packPrice: Math.max(1, Number(e.target.value) || 0) })
            }
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>

        <div>
          <label htmlFor="cfg-long" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Long form ($)
          </label>
          <input
            id="cfg-long"
            type="number"
            min={1}
            value={config.longPrice}
            onChange={(e) =>
              setConfig({ ...config, longPrice: Math.max(1, Number(e.target.value) || 0) })
            }
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cfg-std" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Standard turnaround (days · 1 = 24 hours)
          </label>
          <input
            id="cfg-std"
            type="number"
            min={1}
            max={14}
            value={config.standardTurnaroundDays}
            onChange={(e) =>
              setConfig({
                ...config,
                standardTurnaroundDays: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>

        <div>
          <label htmlFor="cfg-pri" className="block text-xs font-semibold text-[#5a6483] mb-1">
            Priority turnaround (days · 1 = 24 hours)
          </label>
          <input
            id="cfg-pri"
            type="number"
            min={1}
            max={14}
            value={config.priorityTurnaroundDays}
            onChange={(e) =>
              setConfig({
                ...config,
                priorityTurnaroundDays: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className="w-full rounded-[12px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <span className="text-xs text-[#5a6483] font-mono-tabular">
          Storefront shows: ${config.singlePrice} / ${config.packPrice} / ${config.longPrice} ·{' '}
          {config.standardTurnaroundDays <= 1
            ? 'Within 24 hours'
            : `${config.standardTurnaroundDays} days`}
        </span>
        <button type="submit" className="btn dark">
          Save catalog rates
        </button>
      </div>
    </form>
  );
}

export default function AdminCatalogBillingPage() {
  const [showRawDb, setShowRawDb] = useState(false);

  return (
    <AdminShell breadcrumb="Catalog & billing">
      {(db, refresh) => {
        const userMap = new Map(db.users.map((u) => [u.id, u]));
        const totalPaid = db.receipts
          .filter((r) => r.status.toLowerCase() === 'paid')
          .reduce((sum, r) => sum + r.amount, 0);

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                Catalog pricing &amp; billing ledger
              </h1>
              <p className="mt-1 text-sm text-[#5a6483]">
                Configure prototype plan rates, manage client invoice statuses, or reset the local
                mock database to defaults.
              </p>
            </div>

            <CatalogSettingsForm
              key={JSON.stringify(db.catalogConfig)}
              initialConfig={db.catalogConfig}
              onSaved={refresh}
            />

            {/* All Client Receipts */}
            <section className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e3e9f6] flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0f1633]">All client invoices (mock)</h2>
                  <p className="text-xs text-[#5a6483] mt-0.5">
                    Toggle receipts between Paid and Refunded to simulate billing adjustments.
                  </p>
                </div>
                <span className="text-sm font-bold font-mono-tabular text-[#0f1633]">
                  ${totalPaid.toLocaleString()} paid
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e3e9f6] text-[12px] font-semibold text-[#5a6483] bg-[#f4f7fd]/70">
                      <th className="py-3 px-6">Invoice</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3e9f6] text-sm">
                    {db.receipts.map((r) => {
                      const client = userMap.get(r.userId);
                      const isPaid = r.status.toLowerCase() === 'paid';
                      return (
                        <tr key={r.id} className="hover:bg-[#f4f7fd]/40 transition-colors">
                          <td className="py-3.5 px-6 font-mono-tabular text-xs font-semibold text-[#0f1633]">
                            {r.id}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#0f1633] whitespace-nowrap">
                            {client?.name ?? 'Unknown'}{' '}
                            <span className="text-[#5a6483]">({client?.company})</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#5a6483]">{r.description}</td>
                          <td className="py-3.5 px-4 font-mono-tabular text-xs text-[#5a6483] whitespace-nowrap">
                            {r.date}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-[#0f1633]">
                            ${r.amount}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                adminUpdateReceiptStatus(r.id, isPaid ? 'Refunded' : 'Paid');
                                refresh();
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                                isPaid
                                  ? 'border-[#e3e9f6] bg-[#f4f7fd] text-[#16a34a] hover:bg-[#e9f1ff]'
                                  : 'border-[#f5c2d3] bg-[#fff4f7] text-[#a3173f]'
                              }`}
                            >
                              {r.status}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Prototype Data Controls */}
            <section className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0f1633]">Mock database controls</h2>
                  <p className="text-xs text-[#5a6483] mt-0.5">
                    Seeded from /data/mock-db.json and persisted locally in browser storage.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRawDb((s) => !s)}
                    className="px-4 py-2 rounded-full border border-[#e3e9f6] bg-white hover:bg-[#f4f7fd] text-xs font-semibold text-[#0f1633] cursor-pointer"
                  >
                    {showRawDb ? 'Hide raw JSON' : 'Inspect raw JSON'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetMockDb();
                      refresh();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0f1633] text-white text-xs font-semibold hover:bg-[#1e2956] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#d9f56b]" />
                    <span>Reset mock database</span>
                  </button>
                </div>
              </div>

              {showRawDb && (
                <pre className="rounded-[16px] bg-[#10162f] text-[#c9d4ff] p-4 text-[11px] font-mono-tabular overflow-x-auto max-h-96">
                  {JSON.stringify(db, null, 2)}
                </pre>
              )}
            </section>
          </div>
        );
      }}
    </AdminShell>
  );
}
