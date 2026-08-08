'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '../../../../lib/api';
import { formatNaira, MADE_TO_MEASURE_CATEGORIES } from '../../../../lib/format';
import { useCart } from '../../../../context/CartContext';
import { useAuth } from '../../../../context/AuthContext';
import MeasurementsForm from '../../../../components/MeasurementsForm';
import ProductReviews from '../../../../components/ProductReviews';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem, setOpen } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [useMeasurements, setUseMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState({});
  const [added, setAdded] = useState(false);

  useEffect(() => {
    productsApi.list().then((all) => {
      const found = all.find((p) => String(p.id) === String(id));
      setProduct(found || null);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.measurements) setMeasurements(user.measurements);
  }, [user]);

  if (loading) {
    return <div className="center" style={{ padding: 100 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  }

  if (!product) {
    return (
      <div className="center" style={{ padding: 100 }}>
        <h2>Product Not Found</h2>
        <Link href="/shop" className="btn btn-dark mt-24">Back To Shop</Link>
      </div>
    );
  }

  const isMtm = MADE_TO_MEASURE_CATEGORIES.includes(product.cat);
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5);

  function handleAdd() {
    addItem(product, qty, isMtm && useMeasurements ? measurements : null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <section>
      <div className="product-detail">
        <div className="gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.img} alt={product.name} />
        </div>
        <div className="info">
          <span className="eyebrow">{product.cat}</span>
          <h1>{product.name}</h1>
          <div className="price-row">
            <span className="price" style={{ fontSize: '1.3rem' }}>{formatNaira(product.price)}</span>
            {product.oldPrice && <span className="price old">{formatNaira(product.oldPrice)}</span>}
          </div>
          <p className="desc">{product.desc}</p>

          {outOfStock ? (
            <p className="stock-note out">Currently out of stock.</p>
          ) : lowStock ? (
            <p className="stock-note low">Only {product.stock} left — order soon.</p>
          ) : null}

          <div className="qty-row">
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          {isMtm && (
            <div className="measure-panel">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={useMeasurements} onChange={(e) => setUseMeasurements(e.target.checked)} />
                <span style={{ fontWeight: 600 }}>Order made-to-measure with my own inscription</span>
              </label>
              <p className="hint">Adds 10–14 business days for tailoring instead of the standard 3–5.</p>
              {useMeasurements && (
                <>
                  <MeasurementsForm values={measurements} onChange={setMeasurements} />
                  {!user && (
                    <p className="hint mt-16">
                      <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Log in</Link> to save these measurements to your account for next time.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <button className="btn btn-solid btn-block" disabled={outOfStock} onClick={handleAdd}>
            {outOfStock ? 'Out Of Stock' : added ? 'Added ✓' : 'Add To Cart'}
          </button>
          <button className="btn btn-outline btn-block mt-16" disabled={outOfStock} onClick={() => { handleAdd(); router.push('/checkout'); }}>
            Buy Now
          </button>
        </div>
      </div>

      <div className="stitch on-white mt-32"><span className="stitch-mark">DETAILS</span></div>

      <div className="mt-32" style={{ maxWidth: 720 }}>
        <ProductReviews productId={product.id} />
      </div>
    </section>
  );
}
