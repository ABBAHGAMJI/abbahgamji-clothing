'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { couponsApi } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import Modal from '../../../components/admin/Modal';

const EMPTY_FORM = { code: '', type: 'percent', value: '', minSpend: '', expiresAt: '' };

export default function AdminCouponsPage() {
  const { adminToken } = useAdminAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    couponsApi.listAdmin(adminToken).then(setCoupons).finally(() => setLoading(false));
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await couponsApi.create(adminToken, {
        code: form.code, type: form.type, value: Number(form.value),
        minSpend: form.minSpend ? Number(form.minSpend) : 0,
        expiresAt: form.expiresAt || null
      });
      setCreating(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c) {
    await couponsApi.patch(adminToken, c.code, { active: !c.active });
    load();
  }

  async function handleDelete(c) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await couponsApi.remove(adminToken, c.code);
    load();
  }

  return (
    <>
      <div className="admin-header">
        <h1>Coupons</h1>
        <button className="btn btn-dark" onClick={() => { setForm(EMPTY_FORM); setError(''); setCreating(true); }}>+ New Coupon</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Spend</th><th>Expires</th><th>Used</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td>{c.code}</td>
                  <td>{c.type}</td>
                  <td>{c.type === 'percent' ? `${c.value}%` : `₦${c.value.toLocaleString()}`}</td>
                  <td>{c.minSpend ? `₦${c.minSpend.toLocaleString()}` : '—'}</td>
                  <td>{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                  <td>{c.usedCount || 0}</td>
                  <td><span className={`badge ${c.active ? 'paid' : 'unpaid'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleActive(c)}>{c.active ? 'Disable' : 'Enable'}</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <Modal title="New Coupon" onClose={() => setCreating(false)}>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="cp-code">Code</label>
              <input id="cp-code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="cp-type">Type</label>
                <select id="cp-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="percent">Percent Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="cp-value">{form.type === 'percent' ? 'Percent' : 'Amount (₦)'}</label>
                <input id="cp-value" type="number" min="1" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="cp-min">Minimum Spend (₦)</label>
                <input id="cp-min" type="number" min="0" value={form.minSpend} onChange={(e) => setForm({ ...form, minSpend: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="cp-exp">Expires On (optional)</label>
                <input id="cp-exp" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-solid btn-block" disabled={saving}>{saving ? 'Creating…' : 'Create Coupon'}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
