'use client';

import { useEffect, useState } from 'react';
import { reviewsApi } from '../lib/api';
import { formatDate } from '../lib/format';
import StarRating from './StarRating';

export default function ProductReviews({ productId }) {
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load() {
    setLoading(true);
    reviewsApi.list(productId).then(setData).finally(() => setLoading(false));
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await reviewsApi.create({ productId, ...form, rating: Number(form.rating) });
      setForm({ name: '', rating: 5, comment: '' });
      setSuccess('Thanks — your review is live.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <h3>Customer Reviews</h3>
        {data.count > 0 && <StarRating value={data.average} count={data.count} size={16} />}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : data.reviews.length === 0 ? (
        <p className="muted mb-24">No reviews yet — be the first to share your experience.</p>
      ) : (
        <div className="mb-24">
          {data.reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="rc-head">
                <span className="rc-name">{r.name}</span>
                <span className="rc-date">{formatDate(r.createdAt)}</span>
              </div>
              <StarRating value={r.rating} size={13} />
              <p className="mt-8">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h4 className="mb-16">Write A Review</h4>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="rv-name">Your Name</label>
              <input id="rv-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="rv-rating">Rating</label>
              <select id="rv-rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="rv-comment">Comment</label>
            <textarea id="rv-comment" required rows={3} maxLength={800} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </div>
          <button className="btn btn-dark" disabled={submitting}>{submitting ? 'Posting…' : 'Post Review'}</button>
        </form>
      </div>
    </div>
  );
}
