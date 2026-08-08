'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { reviewsApi, productsApi } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import StarRating from '../../../components/StarRating';

export default function AdminReviewsPage() {
  const { adminToken } = useAdminAuth();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([reviewsApi.list(), productsApi.list()])
      .then(([r, p]) => { setReviews(r.reviews); setProducts(p); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function productName(id) {
    return products.find((p) => p.id === id)?.name || `Product #${id}`;
  }

  async function handleDelete(r) {
    if (!confirm('Remove this review?')) return;
    await reviewsApi.remove(adminToken, r.id);
    load();
  }

  return (
    <>
      <div className="admin-header"><h1>Reviews</h1></div>
      {loading ? <div className="spinner" /> : reviews.length === 0 ? (
        <p className="muted">No reviews yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Name</th><th>Rating</th><th>Comment</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>{productName(r.productId)}</td>
                  <td>{r.name}</td>
                  <td><StarRating value={r.rating} size={12} /></td>
                  <td style={{ whiteSpace: 'normal', maxWidth: 320 }}>{r.comment}</td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
