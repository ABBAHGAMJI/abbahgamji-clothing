import Link from 'next/link';
import { CATEGORIES } from '../lib/format';

export default function Footer() {
  return (
    <footer className="site">
      <div className="footer-grid">
        <div>
          <span className="logo-word" style={{ display: 'block', marginBottom: 16 }}>
            ABBAH<span style={{ color: 'var(--gold)' }}>GAMJI</span>
          </span>
          <p style={{ fontSize: '.88rem', maxWidth: 320, color: 'rgba(246,241,228,.7)' }}>
            Premium made-to-measure Northern Nigerian fashion — tailored for style, class, distinction and comfort.
          </p>
        </div>
        <div>
          <h5>Shop</h5>
          <ul>
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c}><Link href={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h5>Customer Care</h5>
          <ul>
            <li><Link href="/track">Track Order</Link></li>
            <li><Link href="/login">My Account</Link></li>
            <li><Link href="/shop">All Products</Link></li>
          </ul>
        </div>
        <div>
          <h5>Get In Touch</h5>
          <ul>
            <li>hello@abbahgamji.com</li>
            <li>Nationwide delivery, Nigeria</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ABBAHGAMJI. All rights reserved.</span>
        <span>Handcrafted with distinction.</span>
      </div>
    </footer>
  );
}
