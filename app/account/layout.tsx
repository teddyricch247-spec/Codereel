import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Studio',
  description: 'Review cuts, submit edit notes, manage brand defaults, and download 1080p MP4s.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
