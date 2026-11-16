import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Codereel client studio to watch cuts, request edits, and download 1080p MP4s.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
