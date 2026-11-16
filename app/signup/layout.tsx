import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a Codereel prototype workspace to store briefs, edit rounds, and brand defaults.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
