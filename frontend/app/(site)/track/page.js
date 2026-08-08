'use client';

import { useState } from 'react';
import { ordersApi } from '../../../lib/api';
import OrderStatusCard from '../../../components/OrderStatusCard';

export default function TrackPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const result = await ordersApi.track(query.trim());
      setOrder(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-hero">
        <h1>Track Your Order</h1>
        <p>Enter your order ID (e.g. ABG-1A2B3C4D) or the phone number you checked out with.</p>
      </div>
      <section>
        <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: 480 }}>
          <div className="field">
            <label htmlFor="track-q">Order ID or Phone Number</label>
            <input id="track-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ABG-1A2B3C4D" />
          </div>
          <button className="btn btn-dark btn-block" disabled={loading}>{loading ? 'Searching…' : 'Track Order'}</button>
        </form>

        {error && <div className="alert error center mt-24" style={{ maxWidth: 480, margin: '24px auto 0' }}>{error}</div>}

        {order && (
          <div className="mt-32">
            <OrderStatusCard order={order} />
          </div>
        )}
      </section>
    </>
  );
}
