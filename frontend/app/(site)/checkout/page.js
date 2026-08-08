'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { ordersApi, paymentsApi, couponsApi } from '../../../lib/api';
import { formatNaira } from '../../../lib/format';

const FLW_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || '';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { token, user } = useAuth();

  const [customer, setCustomer] = useState({ name: user?.name || '', email: user?.email || '', phone: '', address: '' });
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [flwReady, setFlwReady] = useState(false);

  const discount = couponResult?.valid ? couponResult.discount : 0;
  const pointsDiscount = Math.min(Number(pointsToRedeem) || 0, user?.loyaltyPoints || 0) * 5;
  const estimatedTotal = Math.max(0, subtotal - discount - pointsDiscount);

  async function checkCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError('');
    try {
      const res = await couponsApi.validate(couponCode.trim(), subtotal);
      if (!res.valid) {
        setCouponError(res.error);
        setCouponResult(null);
      } else {
        setCouponResult(res);
      }
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCheckingCoupon(false);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');

    if (!customer.name || !customer.phone || !customer.address) {
      setError('Name, phone and delivery address are required.');
      return;
    }
    if (items.length === 0) {
      setError('Your bag is empty.');
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, measurements: i.measurements || null })),
        customer: { ...customer, location: useMyLocation ? location : null },
        couponCode: couponResult?.valid ? couponCode.trim() : undefined,
        pointsToRedeem: Number(pointsToRedeem) || 0
      };
      const order = await ordersApi.create(payload, token);

      if (order.total <= 0) {
        clearCart();
        router.push(`/order-confirmation/${order.id}`);
        return;
      }

      if (!FLW_PUBLIC_KEY || !window.FlutterwaveCheckout) {
        setError('Payment could not be started. Please refresh and try again.');
        setPlacing(false);
        return;
      }

      window.FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: order.id,
        amount: order.total,
        currency: 'NGN',
        payment_options: 'card,banktransfer,ussd',
        customer: { email: customer.email || 'guest@abbahgamji.com', phone_number: customer.phone, name: customer.name },
        customizations: { title: 'ABBAHGAMJI', description: `Order ${order.id}`, logo: '' },
        callback: async (response) => {
          try {
            await paymentsApi.verify(response.transaction_id, order.id);
          } catch (err) {
            // Verification failed client-side — the order still exists and can
            // be tracked/retried; surface this rather than silently losing it.
            console.error(err);
          } finally {
            clearCart();
            router.push(`/order-confirmation/${order.id}`);
          }
        },
        onclose: () => setPlacing(false)
      });
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '100px 20px' }}>
        <p>Your bag is empty — add something before checking out.</p>
        <Link href="/shop" className="btn btn-dark mt-24">Shop Now</Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="afterInteractive" onLoad={() => setFlwReady(true)} />
      <div className="page-hero"><h1>Checkout</h1></div>
      <section>
        <form className="checkout-grid" onSubmit={handlePlaceOrder}>
          <div>
            {error && <div className="alert error">{error}</div>}
            <h3 className="mb-16">Delivery Details</h3>
            <div className="field">
              <label htmlFor="c-name">Full Name</label>
              <input id="c-name" required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="c-phone">Phone Number</label>
                <input id="c-phone" required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="c-email">Email (for order updates)</label>
                <input id="c-email" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="c-address">Delivery Address</label>
              <textarea id="c-address" required rows={3} value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <input
                type="checkbox"
                checked={useMyLocation}
                onChange={(e) => { setUseMyLocation(e.target.checked); if (e.target.checked && !location) detectLocation(); }}
              />
              <span>Share my live location to help the rider find me {locating && '(detecting…)'}</span>
            </label>

            <h3 className="mb-16">Coupon Code</h3>
            <div className="coupon-row">
              <input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button type="button" className="btn btn-outline btn-sm" onClick={checkCoupon} disabled={checkingCoupon}>
                {checkingCoupon ? 'Checking…' : 'Apply'}
              </button>
            </div>
            {couponError && <div className="alert error">{couponError}</div>}
            {couponResult?.valid && <div className="alert success">Coupon applied: −{formatNaira(couponResult.discount)}</div>}

            {user && user.loyaltyPoints > 0 && (
              <>
                <h3 className="mb-16 mt-24">Loyalty Points</h3>
                <p className="muted mb-16">You have {user.loyaltyPoints} points (₦5 off per point).</p>
                <div className="field">
                  <input
                    type="number" min="0" max={user.loyaltyPoints}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(e.target.value)}
                    placeholder="Points to redeem"
                  />
                </div>
              </>
            )}
          </div>

          <div className="summary-card">
            <h3 className="mb-16">Order Summary</h3>
            {items.map((i) => (
              <div className="summary-row" key={`${i.productId}-${i.measurements ? 'mtm' : 'std'}`}>
                <span>{i.name} × {i.qty}</span>
                <span>{formatNaira(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
            {discount > 0 && <div className="summary-row"><span>Coupon</span><span>−{formatNaira(discount)}</span></div>}
            {pointsDiscount > 0 && <div className="summary-row"><span>Points Redeemed</span><span>−{formatNaira(pointsDiscount)}</span></div>}
            <div className="summary-row total"><span>Total</span><span>{formatNaira(estimatedTotal)}</span></div>
            <button className="btn btn-solid btn-block mt-24" disabled={placing}>
              {placing ? 'Processing…' : 'Pay & Place Order'}
            </button>
            <p className="muted mt-16" style={{ fontSize: '.78rem' }}>
              Secure payment via Flutterwave. Made-to-measure items add 10–14 business days for tailoring.
            </p>
          </div>
        </form>
      </section>
    </>
  );
}
