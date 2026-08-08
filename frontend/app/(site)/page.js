'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, reviewsApi, ordersApi } from '../../lib/api';
import { CATEGORIES } from '../../lib/format';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../context/AuthContext';

// The backend emails magic-login and order-tracking links that point at the
// frontend root with a query param (?magicToken=... or ?orderToken=...) —
// see routes/auth.js and routes/orderLinks.js. Catch those here and hand the
// visitor off to the right place before rendering the normal homepage.
function MagicLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithMagicToken } = useAuth();
  const [status, setStatus] = useState(null); // null | 'working' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const magicToken = searchParams.get('magicToken');
    const orderToken = searchParams.get('orderToken');
    if (!magicToken && !orderToken) return;

    setStatus('working');
    (async () => {
      try {
        if (magicToken) {
          await loginWithMagicToken(magicToken);
          router.replace('/account');
        } else if (orderToken) {
          const order = await ordersApi.verifyLink(orderToken);
          router.replace(`/order-confirmation/${order.id}`);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (status === 'working') {
    return (
      <div className="center" style={{ padding: 100 }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p className="mt-16">Signing you in…</p>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="center" style={{ padding: 100 }}>
        <div className="alert error" style={{ maxWidth: 420, margin: '0 auto' }}>{message}</div>
        <Link href="/login" className="btn btn-dark mt-24">Go To Login</Link>
      </div>
    );
  }
  return null;
}

function HomeContent() {
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const hasLinkToken = searchParams.get('magicToken') || searchParams.get('orderToken');

  useEffect(() => {
    Promise.all([productsApi.list(), reviewsApi.summary().catch(() => ({}))])
      .then(([prods, summary]) => {
        setProducts(prods);
        setRatings(summary);
      })
      .finally(() => setLoading(false));
  }, []);

  if (hasLinkToken) return <MagicLinkHandler />;

  const featured = products.slice(0, 8);

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Northern Nigerian Fashion House</span>
        <h1 className="display">Tailored For Style, Class, Distinction &amp; Comfort</h1>
        <p>
          Made-to-measure kaftans, jallabiyas, senator wear, agbada, hijabs and long gowns —
          finished by hand and delivered nationwide.
        </p>
        <div className="cta-row">
          <Link href="/shop" className="btn btn-solid">Shop The Collection</Link>
          <Link href="/track" className="btn btn-outline">Track An Order</Link>
        </div>
      </section>

      <div className="stitch on-white"><span className="stitch-mark">ABBAHGAMJI</span></div>

      <section>
        <div className="section-head">
          <span className="eyebrow">Browse</span>
          <h2>Shop By Category</h2>
          <p>Ten collections, each cut and finished with the same attention to detail.</p>
        </div>
        <div className="chip-row">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} className="chip">{c}</Link>
          ))}
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="eyebrow">Signature Pieces</span>
          <h2>Featured This Season</h2>
        </div>
        {loading ? (
          <div className="center"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
            ))}
          </div>
        )}
        <div className="center mt-32">
          <Link href="/shop" className="btn btn-dark">View Full Collection</Link>
        </div>
      </section>

      <div className="stitch dark"><span className="stitch-mark">EST. DISTINCTION</span></div>

      <section style={{ background: 'var(--ink)', color: 'var(--ivory)', textAlign: 'center' }}>
        <span className="eyebrow">Made To Measure</span>
        <h2 className="mt-16" style={{ maxWidth: 640, margin: '16px auto 0' }}>
          Your Own Tailor&apos;s Inscription, Saved To Your Account
        </h2>
        <p style={{ maxWidth: 560, margin: '18px auto 0', color: 'rgba(246,241,228,.8)' }}>
          Create an account, save your measurements once, and every made-to-measure order after that
          fits exactly the way you like — no repeating yourself at checkout.
        </p>
        <div className="cta-row" style={{ justifyContent: 'center' }}>
          <Link href="/register" className="btn btn-solid">Create Your Account</Link>
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="center" style={{ padding: 100 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}>
      <HomeContent />
    </Suspense>
  );
}
