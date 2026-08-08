'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '../../../../lib/api';
import OrderStatusCard from '../../../../components/OrderStatusCard';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.track(id).then(setOrder).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <div className="page-hero">
        <h1>Thank You For Your Order</h1>
        <p>A confirmation email is on its way with a link to track this order.</p>
      </div>
      <section>
        {loading ? (
          <div className="center"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : error ? (
          <div className="alert error center" style={{ maxWidth: 480, margin: '0 auto' }}>{error}</div>
        ) : (
          <OrderStatusCard order={order} />
        )}
        <div className="center mt-32">
          <Link href="/shop" className="btn btn-dark">Continue Shopping</Link>
        </div>
      </section>
    </>
  );
}
