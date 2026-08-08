'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { productsApi } from '../../../lib/api';
import { CATEGORIES, formatNaira } from '../../../lib/format';
import Modal from '../../../components/admin/Modal';

const EMPTY_FORM = { name: '', cat: CATEGORIES[0], price: '', oldPrice: '', img: '', desc: '', stock: 20, lowStockThreshold: 5 };

export default function AdminProductsPage() {
  const { adminToken } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    productsApi.list().then(setProducts).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setError('');
    setEditing({});
  }

  function openEdit(p) {
    setForm({
      name: p.name, cat: p.cat, price: p.price, oldPrice: p.oldPrice || '',
      img: p.img, desc: p.desc, stock: p.stock, lowStockThreshold: p.lowStockThreshold
    });
    setError('');
    setEditing(p);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold)
      };
      if (editing?.id) {
        await productsApi.update(adminToken, editing.id, payload);
      } else {
        await productsApi.create(adminToken, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await productsApi.remove(adminToken, p.id);
    load();
  }

  return (
    <>
      <div className="admin-header">
        <h1>Products</h1>
        <button className="btn btn-dark" onClick={openNew}>+ Add Product</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.cat}</td>
                  <td>{formatNaira(p.price)}{p.oldPrice ? ` (was ${formatNaira(p.oldPrice)})` : ''}</td>
                  <td>{p.stock ?? '—'}{typeof p.stock === 'number' && p.stock <= (p.lowStockThreshold ?? 5) ? ' ⚠️' : ''}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <Modal title={editing?.id ? 'Edit Product' : 'Add Product'} onClose={() => setEditing(null)}>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="p-name">Name</label>
              <input id="p-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="p-cat">Category</label>
                <select id="p-cat" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="p-price">Price (₦)</label>
                <input id="p-price" type="number" min="1" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="p-oldprice">Old Price (optional, for sale badge)</label>
                <input id="p-oldprice" type="number" min="0" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="p-stock">Stock</label>
                <input id="p-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="p-threshold">Low Stock Threshold</label>
              <input id="p-threshold" type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="p-img">Image URL</label>
              <input id="p-img" required value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="p-desc">Description</label>
              <textarea id="p-desc" rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            </div>
            <button className="btn btn-solid btn-block" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
