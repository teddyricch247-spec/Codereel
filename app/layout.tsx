import type { Metadata, Viewport } from 'next';
import './globals.css';
import RouteTransitionProvider from '@/components/RouteTransitionProvider';

function resolveMetadataBase(): URL {
  const raw = process.env.APP_URL;
  if (raw && raw !== 'MY_APP_URL') {
    try {
      return new URL(raw);
    } catch {
      // fall through to localhost
    }
  }
  return new URL('http://localhost:3000');
}

const SITE_TITLE = 'Codereel – Videos built in code, made for you';
const SITE_DESC =
  'Skip the prompting and re-renders. Pick a style, send a brief, pay one flat price, and receive your 1080p code-built video in 24 hours.';

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: SITE_TITLE,
    template: '%s – Codereel',
  },
  description: SITE_DESC,
  applicationName: 'Codereel',
  keywords: [
    'code-built videos',
    'product demo video',
    'kinetic typography video',
    'SaaS launch reel',
    'motion graphics studio',
    'flat price video production',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    siteName: 'Codereel',
    type: 'website',
    locale: 'en_US',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7ea5ff',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Codereel',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      description: SITE_DESC,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '149',
        highPrice: '399',
        offerCount: '3',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do I need to know how to code?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. You send the brief and we handle everything else.',
          },
        },
        {
          '@type': 'Question',
          name: 'What do I get?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A 1080p MP4 in your account, ready for social, your site or ads.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does it take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most first cuts arrive within 24 hours after payment. Pack of 3 orders get priority.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <RouteTransitionProvider>{children}</RouteTransitionProvider>
      </body>
    </html>
  );
}
