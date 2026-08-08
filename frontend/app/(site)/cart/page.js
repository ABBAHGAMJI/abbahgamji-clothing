'use client';

import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { formatNaira } from '../../../lib/format';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, lineKey } = useCart();

  return (
    <>
      <div className="page-hero">
        <h1>Your Bag</h1>
      </div>
      <section>
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Your bag is empty.</p>
            <Link href="/shop" className="btn btn-dark mt-24">Start Shopping</Link>
          </div>
        ) : (
          <div className="checkout-grid">
            <div>
              {items.map((item) => (
                <div className="cart-line" key={lineKey(item)} style={{ alignItems: 'flex-start' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.name} style={{ width: 90, height: 110 }} />
                  <div className="cl-info">
                    <h4 style={{ fontSize: '1.05rem' }}>{item.name}</h4>
                    {item.measurements && <div className="cl-meta">Made-to-measure — 10–14 business days</div>}
                    <div className="cl-meta">{formatNaira(item.price)} each</div>
                    <div className="cl-actions">
                      <div className="qty-stepper">
                        <button onClick={() => updateQty(item, item.qty - 1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item, item.qty + 1)}>+</button>
                      </div>
                      <button className="muted" style={{ background: 'none', border: 'none', fontSize: '.82rem', textDecoration: 'underline' }} onClick={() => removeItem(item)}>Remove</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{formatNaira(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div className="summary-card">
              <div className="summary-row"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
              <div className="summary-row total"><span>Total</span><span>{formatNaira(subtotal)}</span></div>
              <Link href="/checkout" className="btn btn-solid btn-block mt-24">Proceed To Checkout</Link>
              <Link href="/shop" className="btn btn-outline btn-block mt-16">Continue Shopping</Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
