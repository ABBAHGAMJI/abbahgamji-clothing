'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { customersApi } from '../../../lib/api';

export default function AdminCustomersPage() {
  const { adminToken } = useAdminAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customersApi.list(adminToken).then(setCustomers).finally(() => setLoading(false));
  }, [adminToken]);

  return (
    <>
      <div className="admin-header"><h1>Customers</h1></div>
      {loading ? <div className="spinner" /> : customers.length === 0 ? (
        <p className="muted">No customer accounts yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Measurements Saved</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.measurements ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
