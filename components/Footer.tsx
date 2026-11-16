import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <Logo />
      <nav aria-label="Footer">
        <Link href="/">Home</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/order">Order a video</Link>
        <Link href="/login">Sign in</Link>
        <Link href="/account">Client studio</Link>
        <Link href="/admin">Admin portal</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <span>Design prototype · local mock data only</span>
    </footer>
  );
}
