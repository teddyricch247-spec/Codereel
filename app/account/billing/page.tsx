'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Database, RotateCcw } from 'lucide-react';
import AccountShell from '@/components/AccountShell';
import { getDb, getUserReceipts, resetMockDb } from '@/lib/mock-db';

export default function BillingAndDataPage() {
  const [showRawDb, setShowRawDb] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  return (
    <AccountShell breadcrumb="Billing & data">
      {(user, refresh) => {
        const receipts = getUserReceipts(user.id);
        const dbSnapshot = getDb();

        const handleReset = () => {
          resetMockDb();
          refresh();
          setResetMessage('Prototype database restored to /data/mock-db.json defaults.');
          setTimeout(() => setResetMessage(''), 3200);
        };

        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                  Billing & prototype data
                </h1>
                <p className="mt-1 text-sm text-[#5a6483]">
                  Flat-price order receipts, pack credits, and local mock database controls.
                </p>
              </div>
              <Link href="/pricing" className="btn dark shrink-0">
                Compare plans
              </Link>
            </div>

            {/* Credits Banner */}
            <section className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#5a6483]">Active plan</div>
                <div className="mt-1 text-xl font-bold text-[#0f1633]">
                  {user.planName}{' '}
                  <span className="text-sm font-medium text-[#5a6483] tabular-nums">
                    · {user.packCreditsRemaining} prepaid video{' '}
                    {user.packCreditsRemaining === 1 ? 'credit' : 'credits'} remaining
                  </span>
                </div>
              </div>
              <Link href="/order?plan=pack" className="btn lime shrink-0">
                {user.packCreditsRemaining > 0
                  ? 'Use a pack credit'
                  : `Order Pack of 3 ($${dbSnapshot.catalogConfig.packPrice})`}
              </Link>
            </section>

            {/* Receipts Table */}
            <section className="bg-white border border-[#e3e9f6] rounded-[24px] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e3e9f6]">
                <h2 className="text-lg font-bold text-[#0f1633]">Receipts</h2>
              </div>
              {receipts.length === 0 ? (
                <div className="p-8 text-sm text-[#5a6483]">
                  No mock receipts recorded for this prototype user yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#e3e9f6] text-xs font-semibold text-[#5a6483] bg-[#f4f7fd]/50">
                        <th className="py-3 px-6">Invoice</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e9f6]">
                      {receipts.map((r) => (
                        <tr key={r.id}>
                          <td className="py-3.5 px-6 font-mono-tabular font-semibold text-[#0f1633]">
                            {r.id}
                          </td>
                          <td className="py-3.5 px-4 font-mono-tabular text-[#5a6483]">{r.date}</td>
                          <td className="py-3.5 px-4 text-[#0f1633]">{r.description}</td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-[#0f1633]">
                            ${r.amount}
                          </td>
                          <td className="py-3.5 px-6 text-right text-xs font-semibold text-[#16a34a]">
                            {r.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Mock Database Inspector & Reset */}
            <section className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-[#4a43e8] mt-0.5 shrink-0" />
                  <div>
                    <h2 className="text-base font-bold text-[#0f1633]">
                      Prototype mock database (/data/mock-db.json)
                    </h2>
                    <p className="mt-0.5 text-xs text-[#5a6483]">
                      All logged-in data is seeded from <code className="font-mono-tabular">/data/mock-db.json</code>{' '}
                      and persisted locally in browser storage as you test edits or new orders.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowRawDb((v) => !v)}
                    className="px-4 py-2 rounded-full border border-[#e3e9f6] hover:bg-[#f4f7fd] text-xs font-semibold text-[#0f1633] cursor-pointer whitespace-nowrap"
                  >
                    {showRawDb ? 'Hide JSON' : 'Inspect active JSON'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f4f7fd] hover:bg-[#e9f1ff] text-xs font-semibold text-[#0f1633] cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset mock data</span>
                  </button>
                </div>
              </div>

              {resetMessage && (
                <p className="text-xs font-semibold text-[#16a34a]">{resetMessage}</p>
              )}

              {showRawDb && (
                <pre className="rounded-[16px] bg-[#10162f] text-[#c9d4ff] p-4 text-xs font-mono-tabular overflow-x-auto max-h-96">
                  {JSON.stringify(dbSnapshot, null, 2)}
                </pre>
              )}
            </section>
          </div>
        );
      }}
    </AccountShell>
  );
}
