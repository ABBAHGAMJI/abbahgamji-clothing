'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../lib/format';

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, removeItem, subtotal, lineKey } = useCart();

  if (!open) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setOpen(false)} />
      <aside className="cart-drawer">
        <div className="cd-head">
          <h3>Your Bag {items.length > 0 && `(${items.length})`}</h3>
          <button className="icon-btn" style={{ color: 'var(--ink)' }} onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>
        <div className="cd-items">
          {items.length === 0 ? (
            <div className="empty-state">
              <p>Your bag is empty.</p>
              <Link href="/shop" className="btn btn-dark btn-sm mt-16" onClick={() => setOpen(false)}>Start Shopping</Link>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-line" key={lineKey(item)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.name} />
                <div className="cl-info">
                  <h4>{item.name}</h4>
                  {item.measurements && <div className="cl-meta">Made-to-measure</div>}
                  <div className="cl-meta">{formatNaira(item.price)} each</div>
                  <div className="cl-actions">
                    <div className="qty-stepper">
                      <button onClick={() => updateQty(item, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item, item.qty + 1)}>+</button>
                    </div>
                    <button className="muted" style={{ background: 'none', border: 'none', fontSize: '.78rem', textDecoration: 'underline' }} onClick={() => removeItem(item)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="cd-foot">
            <div className="cd-subtotal">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <Link href="/checkout" className="btn btn-solid btn-block" onClick={() => setOpen(false)}>
              Checkout
            </Link>
            <Link href="/cart" className="btn btn-outline btn-block mt-16" onClick={() => setOpen(false)}>
              View Bag
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
