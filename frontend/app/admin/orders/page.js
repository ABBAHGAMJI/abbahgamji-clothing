'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { ordersApi } from '../../../lib/api';
import { formatDate, formatNaira } from '../../../lib/format';
import Modal from '../../../components/admin/Modal';

const STAGES = ['Order Placed', 'Cutting & Tailoring', 'Quality Check', 'Out For Delivery', 'Delivered'];

export default function AdminOrdersPage() {
  const { adminToken } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [updating, setUpdating] = useState(false);

  function load() {
    setLoading(true);
    ordersApi.listAdmin(adminToken).then((data) => setOrders([...data].reverse())).finally(() => setLoading(false));
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function handleStatusChange(order, status) {
    setUpdating(true);
    try {
      await ordersApi.updateStatus(adminToken, order.id, status);
      load();
      setViewing((v) => (v ? { ...v, status } : v));
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Orders</h1>
        <a className="btn btn-outline" href={ordersApi.exportCsvUrl()} target="_blank" rel="noreferrer">Export CSV</a>
      </div>

      {loading ? <div className="spinner" /> : orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th>Paid</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.customer?.name}<br /><span className="muted" style={{ fontSize: '.78rem' }}>{o.customer?.phone}</span></td>
                  <td>{formatNaira(o.total)}</td>
                  <td><span className="badge stage">{o.status}</span></td>
                  <td><span className={`badge ${o.paid ? 'paid' : 'unpaid'}`}>{o.paid ? 'Paid' : 'Unpaid'}</span></td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => setViewing(o)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <Modal title={`Order ${viewing.id}`} onClose={() => setViewing(null)}>
          <p><strong>Customer:</strong> {viewing.customer?.name}</p>
          <p><strong>Phone:</strong> {viewing.customer?.phone}</p>
          <p><strong>Email:</strong> {viewing.customer?.email || '—'}</p>
          <p><strong>Address:</strong> {viewing.customer?.address}</p>
          {viewing.customer?.location && (
            <p><strong>Location Pin:</strong> {viewing.customer.location.lat.toFixed(5)}, {viewing.customer.location.lng.toFixed(5)}</p>
          )}
          <div className="stitch on-white mt-16"><span className="stitch-mark">ITEMS</span></div>
          {viewing.items?.map((i, idx) => (
            <div className="summary-row" key={idx}>
              <span>{i.name} × {i.qty}{i.measurements ? ' (made-to-measure)' : ''}</span>
              <span>{formatNaira(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>{formatNaira(viewing.subtotal)}</span></div>
          {viewing.discount > 0 && <div className="summary-row"><span>Discount</span><span>−{formatNaira(viewing.discount)}</span></div>}
          <div className="summary-row total"><span>Total</span><span>{formatNaira(viewing.total)}</span></div>

          <div className="field mt-24">
            <label htmlFor="status-select">Update Status</label>
            <select id="status-select" value={viewing.status} disabled={updating} onChange={(e) => handleStatusChange(viewing, e.target.value)}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
