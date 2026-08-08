'use client';

import Link from 'next/link';
import { formatNaira } from '../lib/format';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

export default function ProductCard({ product, rating }) {
  const { addItem } = useCart();
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5);

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <div className="thumb">
          {product.oldPrice && <span className="sale-badge">Sale</span>}
          {!outOfStock && lowStock && <span className="low-stock">Low Stock</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.img} alt={product.name} loading="lazy" />
        </div>
      </Link>
      <div className="body">
        <div className="cat">{product.cat}</div>
        <h3><Link href={`/product/${product.id}`}>{product.name}</Link></h3>
        <div className="price-row">
          <span className="price">{formatNaira(product.price)}</span>
          {product.oldPrice && <span className="price old">{formatNaira(product.oldPrice)}</span>}
        </div>
        {rating && rating.count > 0 && <StarRating value={rating.average} count={rating.count} />}
        <div className="actions">
          <button
            className="btn btn-dark btn-sm btn-block"
            disabled={outOfStock}
            onClick={() => addItem(product, 1, null)}
          >
            {outOfStock ? 'Out Of Stock' : 'Add To Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
