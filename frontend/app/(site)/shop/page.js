'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, reviewsApi } from '../../../lib/api';
import { CATEGORIES } from '../../../lib/format';
import ProductCard from '../../../components/ProductCard';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('default');

  useEffect(() => {
    setLoading(true);
    Promise.all([productsApi.list(category), reviewsApi.summary().catch(() => ({}))])
      .then(([prods, summary]) => {
        setProducts(prods);
        setRatings(summary);
      })
      .finally(() => setLoading(false));
  }, [category]);

  function setCategory(cat) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') params.delete('category'); else params.set('category', cat);
    router.push(`/shop?${params.toString()}`);
  }

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <>
      <div className="page-hero">
        <h1>Shop The Collection</h1>
        <p>{category === 'all' ? 'All categories' : category}</p>
      </div>

      <section>
        <div className="chip-row">
          <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
          <span className="muted">{sorted.length} item{sorted.length !== 1 ? 's' : ''}</span>
          <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="center"><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">No products found in this category yet.</div>
        ) : (
          <div className="product-grid">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="center" style={{ padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
