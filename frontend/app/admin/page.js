'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { analyticsApi } from '../../lib/api';
import { formatNaira } from '../../lib/format';

export default function AdminAnalyticsPage() {
  const { adminToken } = useAdminAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsApi.summary(adminToken).then(setData).catch((err) => setError(err.message));
  }, [adminToken]);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="spinner" />;

  const maxRevenue = Math.max(1, ...data.revenueByDay.map((d) => d.revenue));

  return (
    <>
      <div className="admin-header">
        <h1>Analytics</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value">{formatNaira(data.totalRevenue)}</div></div>
        <div className="stat-card"><div className="stat-label">Paid Orders</div><div className="stat-value">{data.paidOrders}</div></div>
        <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-value">{data.totalOrders}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Order Value</div><div className="stat-value">{formatNaira(data.avgOrderValue)}</div></div>
        <div className="stat-card"><div className="stat-label">Customers</div><div className="stat-value">{data.totalCustomers}</div></div>
        <div className="stat-card"><div className="stat-label">Products</div><div className="stat-value">{data.totalProducts}</div></div>
      </div>

      <div className="card mb-24">
        <h3 className="mb-16">Revenue — Last 14 Days</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160 }}>
          {data.revenueByDay.map((d) => (
            <div key={d.day} title={`${d.day}: ${formatNaira(d.revenue)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{
                width: '100%', background: 'var(--gold)',
                height: `${Math.max(3, (d.revenue / maxRevenue) * 140)}px`,
                borderRadius: '2px 2px 0 0'
              }} />
              <span style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: 6, writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 40 }}>
                {d.day.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="mb-16">Top Products</h3>
          {data.topProducts.length === 0 ? <p className="muted">No sales yet.</p> : (
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.topProducts.map((p) => (
                  <tr key={p.id}><td>{p.name}</td><td>{p.qty}</td><td>{formatNaira(p.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3 className="mb-16">Low Stock Alerts</h3>
          {data.lowStock.length === 0 ? <p className="muted">Everything is well stocked.</p> : (
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Stock</th><th>Threshold</th></tr></thead>
              <tbody>
                {data.lowStock.map((p) => (
                  <tr key={p.id}><td>{p.name}</td><td>{p.stock}</td><td>{p.threshold}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
