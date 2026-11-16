import type { Metadata } from 'next';
import { Suspense } from 'react';
import OrderFlow from '@/components/OrderFlow';

export const metadata: Metadata = {
  title: 'Order Your Video',
  description:
    'Pick a code-built video style, submit your short brief, choose a flat-price plan, and receive your 1080p MP4 in 24 hours.',
  alternates: {
    canonical: '/order',
  },
};

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderFlow />
    </Suspense>
  );
}
