'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/track', label: 'Track Order' }
];

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="site">
      <Link href="/" className="logo-mark">
        <svg viewBox="0 0 40 40" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 26 L20 12 L28 26" stroke="#c9a24a" strokeWidth="1.4" fill="none" />
          <circle cx="20" cy="20" r="2.4" fill="#c9a24a" />
        </svg>
        <span className="logo-word">ABBAH<span>GAMJI</span></span>
      </Link>

      <nav className={`main-nav ${navOpen ? 'open' : ''}`}>
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={pathname === l.href ? 'active' : ''} onClick={() => setNavOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href={user ? '/account' : '/login'} onClick={() => setNavOpen(false)}>
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Login'}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="head-actions">
        <Link href={user ? '/account' : '/login'} className="icon-btn" aria-label="Account">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" /></svg>
        </Link>
        <button className="icon-btn" aria-label="Open cart" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16l-1.5 12h-13z" /><path d="M8 7V5a4 4 0 018 0v2" /></svg>
          {count > 0 && <span className="cart-count">{count}</span>}
        </button>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setNavOpen((v) => !v)}>
          {navOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
