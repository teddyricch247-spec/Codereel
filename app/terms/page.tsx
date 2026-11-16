import type { Metadata } from 'next';
import Link from 'next/link';
import Clouds from '@/components/Clouds';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Prototype placeholder Terms and Conditions for Codereel.',
  alternates: {
    canonical: '/terms',
  },
};

const SECTIONS = [
  {
    title: '01. Prototype Notice',
    body: 'Codereel is a front-end design prototype. No real payments are processed, no legal contract is formed, and any accounts, video orders, or invoices created on this site exist strictly inside your browser for demonstration purposes.',
  },
  {
    title: '02. Flat-Price Orders & Scope',
    body: 'Each video plan (Single, Pack of 3, or Long form) covers one custom code-authored motion reel per credit up to the selected runtime. Pricing displayed on the prototype ($149, $399, $299) serves as placeholder commercial copy.',
  },
  {
    title: '03. Turnaround & Edit Rounds',
    body: 'First cuts are delivered within 24 hours of receiving a completed brief. Single and Pack of 3 orders include 2 rounds of edits; Long form orders include 3 rounds of edits covering copy, pacing, and brand colors.',
  },
  {
    title: '04. Ownership & 1080p MP4 Rights',
    body: 'Upon completion of your order, you receive full commercial rights to publish, embed, and promote your exported 1080p MP4 files across websites, product launches, social channels, and paid campaigns worldwide.',
  },
  {
    title: '05. Acceptable Content & Brand Assets',
    body: 'When submitting briefs, scripts, or brand color palettes, you confirm you hold permission to use any product names, trademarks, or copy referenced in the video brief.',
  },
  {
    title: '06. Refunds & Cancellations',
    body: 'In a live service environment, orders may be canceled prior to production start for a full refund. Once first-cut authoring has begun, included edit rounds are used to align the cut with your brief.',
  },
];

export default function TermsPage() {
  return (
    <>
      <header className="hero ord">
        <Clouds />
        <div className="wrap">
          <Nav cta={{ href: '/order', label: 'Start your video', short: 'Order' }} />
          <div className="ohead">
            <h1>Terms &amp; Conditions</h1>
            <p>
              Plain-English mockup terms for the Codereel prototype · Updated November 2026
            </p>
          </div>
        </div>
      </header>

      <main className="wrap landing-main">
        <section style={{ paddingTop: '42px' }} aria-label="Terms sections">
          <div className="max-w-3xl space-y-6">
            <div className="rounded-[20px] bg-[#fff6cf] border border-[#f1df8a] px-5 py-4 text-sm text-[#5b4a06]">
              <b>Mockup notice:</b> This page is placeholder legal copy for prototype
              demonstration and should be reviewed by counsel before live launch.
            </div>

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
                Also see our{' '}
                <Link href="/privacy" className="font-semibold text-[#4a43e8] hover:underline">
                  Privacy Policy (mockup)
                </Link>
              </span>
              <Link href="/order" className="btn lime">
                Back to order flow <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
