'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import AccountShell from '@/components/AccountShell';
import { getDb, loginAsDemoUser, saveDb, type MockUser } from '@/lib/mock-db';

function ProfileForm({
  user,
  onSaved,
}: {
  user: MockUser;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company);
  const [role, setRole] = useState(user.role);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const db = getDb();
    const target = db.users.find((u) => u.id === user.id);
    if (target) {
      target.name = name.trim() || target.name;
      target.company = company.trim() || target.company;
      target.role = role.trim() || target.role;
      saveDb(db);
      onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 sm:p-7 space-y-4">
      <h2 className="text-lg font-bold text-[#0f1633]">Profile details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="st-name" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
            Full name
          </label>
          <input
            id="st-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
          />
        </div>
        <div>
          <label htmlFor="st-role" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
            Role
          </label>
          <input
            id="st-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="st-company" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
            Company / workspace
          </label>
          <input
            id="st-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
          />
        </div>
        <div>
          <label htmlFor="st-email" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
            Email (prototype ID)
          </label>
          <input
            id="st-email"
            type="email"
            readOnly
            value={user.email}
            className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd]/60 px-3.5 py-2.5 text-sm text-[#5a6483]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs font-medium text-[#16a34a] flex items-center gap-1.5">
          {saved && (
            <>
              <Check className="w-4 h-4" />
              <span>Profile updated in local mock database</span>
            </>
          )}
        </div>
        <button type="submit" className="btn lime">
          Save profile
        </button>
      </div>
    </form>
  );
}

export default function AccountSettingsPage() {
  return (
    <AccountShell breadcrumb="Settings">
      {(user, refresh) => {
        const allUsers = getDb().users;
        return (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                Account settings
              </h1>
              <p className="mt-1 text-sm text-[#5a6483]">
                Update your prototype profile or switch between mock accounts.
              </p>
            </div>

            <ProfileForm key={user.id} user={user} onSaved={refresh} />

            <section className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 sm:p-7 space-y-4">
              <h2 className="text-lg font-bold text-[#0f1633]">Switch prototype user</h2>
              <p className="text-xs text-[#5a6483]">
                Jump instantly between any user stored in <code className="font-mono-tabular">/data/mock-db.json</code>{' '}
                or created during this session.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allUsers.map((u) => {
                  const isCurrent = u.id === user.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => {
                        loginAsDemoUser(u.email);
                        refresh();
                      }}
                      className={`p-4 rounded-[16px] border text-left transition-colors ${
                        isCurrent
                          ? 'border-[#4a43e8] bg-[#f4f7fd]'
                          : 'border-[#e3e9f6] bg-white hover:bg-[#f4f7fd] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#0f1633]">{u.name}</span>
                        {isCurrent && (
                          <span className="text-[11px] font-semibold text-[#4a43e8]">Active</span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-[#5a6483]">
                        {u.company} · {u.email}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        );
      }}
    </AccountShell>
  );
}
