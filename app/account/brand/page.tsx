'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import AccountShell from '@/components/AccountShell';
import {
  getUserBrandKit,
  STYLE_LABELS,
  updateUserBrandKit,
  type BrandKit,
  type VideoStyle,
} from '@/lib/mock-db';

function BrandKitForm({
  userId,
  initialKit,
  onSaved,
}: {
  userId: string;
  initialKit: BrandKit;
  onSaved: () => void;
}) {
  const [kit, setKit] = useState<BrandKit>(initialKit);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserBrandKit(userId, kit);
    setSavedToast(true);
    onSaved();
    setTimeout(() => setSavedToast(false), 2600);
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <div className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 sm:p-7 space-y-5">
        <div>
          <label htmlFor="bk-company" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
            Company or channel name
          </label>
          <input
            id="bk-company"
            type="text"
            value={kit.companyName}
            onChange={(e) => setKit({ ...kit, companyName: e.target.value })}
            className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bk-primary" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
              Primary brand color
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                aria-label="Pick primary color"
                value={/^#[0-9a-f]{6}$/i.test(kit.primaryColor) ? kit.primaryColor : '#4a43e8'}
                onChange={(e) => setKit({ ...kit, primaryColor: e.target.value })}
                className="w-11 h-11 rounded-[10px] border border-[#e3e9f6] bg-[#f4f7fd] p-1 cursor-pointer"
              />
              <input
                id="bk-primary"
                type="text"
                maxLength={7}
                value={kit.primaryColor}
                onChange={(e) => setKit({ ...kit, primaryColor: e.target.value })}
                className="flex-1 rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bk-accent" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
              Accent highlight color
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                aria-label="Pick accent color"
                value={/^#[0-9a-f]{6}$/i.test(kit.accentColor) ? kit.accentColor : '#d9f56b'}
                onChange={(e) => setKit({ ...kit, accentColor: e.target.value })}
                className="w-11 h-11 rounded-[10px] border border-[#e3e9f6] bg-[#f4f7fd] p-1 cursor-pointer"
              />
              <input
                id="bk-accent"
                type="text"
                maxLength={7}
                value={kit.accentColor}
                onChange={(e) => setKit({ ...kit, accentColor: e.target.value })}
                className="flex-1 rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm font-mono-tabular text-[#0f1633]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bk-style" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
              Default video style
            </label>
            <select
              id="bk-style"
              value={kit.defaultStyle}
              onChange={(e) => setKit({ ...kit, defaultStyle: e.target.value as VideoStyle })}
              className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
            >
              {(Object.keys(STYLE_LABELS) as VideoStyle[]).map((slug) => (
                <option key={slug} value={slug}>
                  {STYLE_LABELS[slug]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bk-length" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
              Default length
            </label>
            <select
              id="bk-length"
              value={kit.defaultLength}
              onChange={(e) => setKit({ ...kit, defaultLength: e.target.value })}
              className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
            >
              <option value="15 seconds">15 seconds</option>
              <option value="30 seconds">30 seconds</option>
              <option value="60 seconds">60 seconds</option>
              <option value="90 seconds">90 seconds</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bk-notes" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
            Standing brief & voice notes
          </label>
          <textarea
            id="bk-notes"
            rows={4}
            value={kit.toneNotes}
            onChange={(e) => setKit({ ...kit, toneNotes: e.target.value })}
            placeholder="Guidelines we should always follow on your cuts…"
            className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-2.5 text-sm text-[#0f1633]"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-medium text-[#16a34a] flex items-center gap-1.5">
            {savedToast && (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to prototype session</span>
              </>
            )}
          </div>
          <button type="submit" className="btn lime">
            Save brand defaults
          </button>
        </div>
      </div>

      {/* Live Preview Swatch */}
      <aside className="bg-white border border-[#e3e9f6] rounded-[24px] p-6 space-y-4">
        <div className="text-sm font-bold text-[#0f1633]">End-card preview</div>
        <div
          className="aspect-video rounded-[16px] p-6 flex flex-col justify-between text-white"
          style={{
            background: `linear-gradient(135deg, #10162f 0%, ${
              /^#[0-9a-f]{6}$/i.test(kit.primaryColor) ? kit.primaryColor : '#4a43e8'
            } 100%)`,
          }}
        >
          <span className="text-xs font-mono-tabular opacity-80">
            {STYLE_LABELS[kit.defaultStyle]} · {kit.defaultLength}
          </span>
          <div>
            <div className="text-xl font-extrabold tracking-tight">{kit.companyName || 'Your Brand'}</div>
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-[#0f1633]"
              style={{
                background: /^#[0-9a-f]{6}$/i.test(kit.accentColor)
                  ? kit.accentColor
                  : '#d9f56b',
              }}
            >
              Ship faster.
            </span>
          </div>
        </div>
        <p className="text-xs text-[#5a6483]">
          Your primary brand color automatically pre-fills new orders when you are signed in.
        </p>
      </aside>
    </form>
  );
}

export default function BrandKitPage() {
  return (
    <AccountShell breadcrumb="Brand kit">
      {(user, refresh) => {
        const kit = getUserBrandKit(user.id);
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0f1633] tracking-tight">
                Brand kit
              </h1>
              <p className="mt-1 text-sm text-[#5a6483]">
                Save your brand colors and preferred style so future video briefs start pre-filled.
              </p>
            </div>
            <BrandKitForm
              key={user.id}
              userId={user.id}
              initialKit={kit}
              onSaved={refresh}
            />
          </div>
        );
      }}
    </AccountShell>
  );
}
