'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Clouds from '@/components/Clouds';
import Nav from '@/components/Nav';
import { PageEnter } from '@/components/MotionPrimitives';
import { signupMockUser } from '@/lib/mock-db';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) {
      setError('Enter a valid email address, like you@company.com.');
      return;
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    setBusy(true);
    signupMockUser({
      name,
      company,
      email,
      password,
    });
    router.push('/account');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="hero flex-1 flex flex-col" style={{ marginBottom: '14px', paddingBottom: '56px' }}>
        <Clouds />
        <div className="wrap w-full flex-1 flex flex-col">
          <Nav cta={{ href: '/login', label: 'Sign in', short: 'Sign in' }} />

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_460px] gap-10 lg:gap-14 items-center py-12 lg:py-16 flex-1">
            <div className="max-w-xl">
              <h1 className="text-[clamp(34px,4.6vw,54px)] font-bold tracking-[-0.03em] leading-[1.06] text-[#0f1633]">
                Start your video workspace <span className="text-[#4a43e8]">in seconds.</span>
              </h1>
              <p className="mt-5 text-[17px] text-[#2c3763] leading-relaxed max-w-[36ch]">
                Create a prototype account to explore the client dashboard, test edit rounds, and
                save your brand colors locally.
              </p>

              <ul className="mt-7 space-y-3 text-[15px] text-[#1e294f]">
                {[
                  'Includes a sample welcome video ready to preview immediately',
                  'Pre-save your brand color and preferred video style for orders',
                  'No real sign-up or email verification — data stays in your browser',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#d9f56b] text-[#0f1633] shrink-0">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <PageEnter className="bg-white border border-[#e3e9f6] rounded-[28px] p-7 sm:p-9 shadow-[0_30px_60px_-32px_rgba(42,58,140,0.45)] relative z-10">
              <h2 className="text-2xl font-bold text-[#0f1633] tracking-tight">
                Create prototype account
              </h2>
              <p className="mt-1.5 text-sm text-[#5a6483]">
                Fake sign-up for this prototype — stored only in your browser session.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="su-name" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
                      Your name
                    </label>
                    <input
                      id="su-name"
                      type="text"
                      placeholder="Jordan Kim"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-3 text-[15px] text-[#0f1633] placeholder:text-[#8691b0]"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-company" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
                      Company <span className="font-normal text-[#5a6483]">(optional)</span>
                    </label>
                    <input
                      id="su-company"
                      type="text"
                      placeholder="Relay Studio"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-3 text-[15px] text-[#0f1633] placeholder:text-[#8691b0]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="su-email" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
                    Work email
                  </label>
                  <input
                    id="su-email"
                    type="email"
                    autoComplete="email"
                    placeholder="jordan@relay.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[14px] border border-[#e3e9f6] bg-[#f4f7fd] px-3.5 py-3 text-[15px] text-[#0f1633] placeholder:text-[#8691b0]"
                  />
                </div>

                <div>
                  <label htmlFor="su-password" className="block text-[13px] font-semibold text-[#0f1633] mb-1.5">
                    Password
                  </label>
                  <input
                    id="su-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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
                  {busy ? 'Creating workspace…' : (
                    <>
                      Create prototype account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-[#5a6483] pt-1">
                  Prototype only ·{' '}
                  <Link href="/terms" className="underline hover:text-[#0f1633]">
                    Terms
                  </Link>{' '}
                  &amp;{' '}
                  <Link href="/privacy" className="underline hover:text-[#0f1633]">
                    Privacy
                  </Link>
                </p>
              </form>

              <div className="mt-6 pt-5 border-t border-[#e3e9f6] flex items-center justify-between text-sm">
                <span className="text-[#5a6483]">Already have an account?</span>
                <Link href="/login" className="font-semibold text-[#4a43e8] hover:underline">
                  Sign in
                </Link>
              </div>
            </PageEnter>
          </div>
        </div>
      </div>
    </div>
  );
}
