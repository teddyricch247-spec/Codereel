import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console',
  description: 'Codereel studio operations console for managing client orders, credits, and inbox.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
