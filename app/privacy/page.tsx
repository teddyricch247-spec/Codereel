import type { Metadata } from 'next';
import Link from 'next/link';
import Clouds from '@/components/Clouds';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Prototype placeholder Privacy Policy for Codereel.',
  alternates: {
    canonical: '/privacy',
  },
};

const SECTIONS = [
  {
    title: '01. Local Browser Storage Only',
    body: 'This Codereel prototype does not transmit form entries, passwords, briefs, or simulated card details to any remote server. All prototype state is seeded from /data/mock-db.json and stored locally in your browser via localStorage.',
  },
  {
    title: '02. Information Used in Briefs',
    body: 'Any video goals, script notes, brand colors, or edit-round comments you type are used strictly to populate your local studio preview (/account) during your session.',
  },
  {
    title: '03. Resetting Prototype Data',
    body: 'You can clear all session changes and restore the baseline mock database at any time from Billing & prototype data inside your studio.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <header className="hero ord">
        <Clouds />
        <div className="wrap">
          <Nav cta={{ href: '/order', label: 'Start your video', short: 'Order' }} />
          <div className="ohead">
            <h1>Privacy Policy</h1>
            <p>How this prototype handles data locally · Updated November 2026</p>
          </div>
        </div>
      </header>

      <main className="wrap landing-main">
        <section style={{ paddingTop: '42px' }} aria-label="Privacy sections">
          <div className="max-w-3xl space-y-6">
            <div className="bg-white border border-[#e3e9f6] rounded-[28px] divide-y divide-[#e3e9f6]">
              {SECTIONS.map((s) => (
                <article key={s.title} className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[#0f1633]">{s.title}</h2>
                  <p className="mt-2.5 text-[15px] text-[#5a6483] leading-relaxed">{s.body}</p>
                </article>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-sm text-[#5a6483]">
              <span>
                Read our{' '}
                <Link href="/terms" className="font-semibold text-[#4a43e8] hover:underline">
                  Terms &amp; Conditions (mockup)
                </Link>
              </span>
              <Link href="/account/billing" className="btn dark">
                Manage prototype data <span className="arr" style={{ background: 'var(--lime)', color: 'var(--ink)' }}>→</span>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
