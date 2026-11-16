import Link from 'next/link';
import Clouds from '@/components/Clouds';
import Nav from '@/components/Nav';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="hero flex-1 flex flex-col" style={{ marginBottom: '14px' }}>
        <Clouds />
        <div className="wrap flex-1 flex flex-col">
          <Nav cta={{ href: '/order', label: 'Start your video', short: 'Order' }} />
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 relative z-10">
            <div className="text-xs font-mono-tabular font-semibold text-[#4a43e8]">404</div>
            <h1 className="mt-2 text-[clamp(34px,5vw,56px)] font-bold text-[#0f1633] tracking-tight">
              This page drifted away.
            </h1>
            <p className="mt-3 text-base text-[#2c3763] max-w-md">
              We couldn’t find that route. Head back to the home page, place an order, or open your
              client studio.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/" className="btn lime">
                Back to home <span className="arr">→</span>
              </Link>
              <Link href="/account" className="btn ghost">
                Open studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
