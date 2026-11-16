'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Clouds from '@/components/Clouds';
import Nav from '@/components/Nav';
import { PageEnter } from '@/components/MotionPrimitives';
import { loginAsDemoUser, loginMockUser } from '@/lib/mock-db';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = loginMockUser(email, password);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    router.push('/account');
  };

  const handleDemoLogin = (demoEmail: string) => {
    setBusy(true);
    loginAsDemoUser(demoEmail);
    router.push('/account');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="hero flex-1 flex flex-col" style={{ marginBottom: '14px', paddingBottom: '56px' }}>
        <Clouds />
        <div className="wrap w-full flex-1 flex flex-col">
          <Nav cta={{ href: '/signup', label: 'Create account', short: 'Sign up' }} />

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_460px] gap-10 lg:gap-14 items-center py-12 lg:py-16 flex-1">
            <div className="max-w-xl">
              <h1 className="text-[clamp(34px,4.6vw,54px)] font-bold tracking-[-0.03em] leading-[1.06] text-[#0f1633]">
                Your finished videos, <span className="text-[#4a43e8]">ready to review.</span>
              </h1>
              <p className="mt-5 text-[17px] text-[#2c3763] leading-relaxed max-w-[34ch]">
                Sign in to watch cuts, request edits by timecode, manage your brand colors, and
                download 1080p MP4s.
              </p>

              <ul className="mt-7 space-y-3 text-[15px] text-[#1e294f]">
                {[
                  'Every ordered video and brief stored in one studio',
                  'Request edits directly on each cut without email threads',
                  'One-click reorder with saved brand colors and length',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#d9f56b] text-[#0f1633] shrink-0">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-white/60">
                <p className="text-xs font-semibold text-[#2c3763] mb-3">
                  Prototype quick sign-in (loads from /data/mock-db.json)
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDemoLogin('maya@acme.co')}
                    className="px-4 py-2.5 rounded-full bg-[#ffffffd8] hover:bg-white text-[#0f1633] text-sm font-semibold border border-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Sign in as Maya Lin (Acme Labs)
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDemoLogin('alex@northstar.io')}
                    className="px-4 py-2.5 rounded-full bg-[#ffffffa6] hover:bg-white text-[#0f1633] text-sm font-semibold border border-white/80 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Sign in as Alex Rivera (Northstar)
                  </button>
                  <Link
                    href="/admin"
                    className="px-4 py-2.5 rounded-full bg-[#0f1633] hover:bg-[#1e2956] text-white text-sm font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                  >
                    <span>Open Admin Console</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d9f56b]" />
                  </Link>
                </div>
              </div>
            </div>

            <PageEnter className="bg-white border border-[#e3e9f6] rounded-[28px] p-7 sm:p-9 shadow-[0_30px_60px_-32px_rgba(42,58,140,0.45)] relative z-10">
              <h2 className="text-2xl font-bold text-[#0f1633] tracking-tight">Sign in</h2>
              <p className="mt-1.5 text-sm text-[#5a6483]">
                Prototype only — uses local mock accounts, nothing is sent to a server.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="maya@acme.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-3 text-[15px] text-[#0f1633] placeholder:text-[#8691b0]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-[13px] font-semibold text-[#0f1633]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('maya@acme.co');
                        setPassword('demo1234');
                        setError('');
                      }}
                      className="text-xs font-semibold text-[#4a43e8] hover:underline cursor-pointer"
                    >
                      Fill demo credentials
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="demo1234"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-3 text-[15px] text-[#0f1633] placeholder:text-[#8691b0]"
                  />
                </div>

                {error && (
                  <p role="alert" className="rounded-[12px] bg-[#fff4f7] border border-[#f5c2d3] px-3.5 py-2.5 text-[13px] font-medium text-[#a3173f]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn lime w-full justify-center mt-2"
                >
                  {busy ? 'Opening account…' : (
                    <>
                      Sign in <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#e3e9f6] flex items-center justify-between text-sm">
                <span className="text-[#5a6483]">New to Codereel?</span>
                <Link href="/signup" className="font-semibold text-[#4a43e8] hover:underline">
                  Create prototype account
                </Link>
              </div>
            </PageEnter>
          </div>
        </div>
      </div>
    </div>
  );
}
