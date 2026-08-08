'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'abg_cart_v1';

// A cart line is: { productId, name, price, img, qty, measurements }
// measurements is null for ready-to-wear, or a tailor's-inscription object
// the customer filled in on the product page for made-to-measure items.

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted cart data
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function lineKey(item) {
    return `${item.productId}::${item.measurements ? JSON.stringify(item.measurements) : 'std'}`;
  }

  function addItem(product, qty = 1, measurements = null) {
    setItems((prev) => {
      const key = `${product.id}::${measurements ? JSON.stringify(measurements) : 'std'}`;
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, {
        productId: product.id, name: product.name, price: product.price,
        img: product.img, qty, measurements, stock: product.stock
      }];
    });
    setOpen(true);
  }

  function updateQty(item, qty) {
    if (qty < 1) return removeItem(item);
    setItems((prev) => prev.map((i) => (lineKey(i) === lineKey(item) ? { ...i, qty } : i)));
  }

  function removeItem(item) {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(item)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = { items, addItem, updateQty, removeItem, clearCart, subtotal, count, open, setOpen, lineKey };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
