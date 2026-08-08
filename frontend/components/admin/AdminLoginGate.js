'use client';

import { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLoginGate() {
  const { loginAsAdmin } = useAdminAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await loginAsAdmin(tokenInput.trim());
    if (!ok) setError('That token was rejected. Check ADMIN_TOKEN in the backend\'s .env file.');
    setLoading(false);
  }

  return (
    <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="form-card">
        <h1>Admin Access</h1>
        <p className="muted center mb-24">
          Enter the ADMIN_TOKEN value from the backend&apos;s <code>.env</code> file.
        </p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="admin-token">Admin Token</label>
            <input id="admin-token" type="password" required value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} />
          </div>
          <button className="btn btn-solid btn-block" disabled={loading}>{loading ? 'Verifying…' : 'Enter Dashboard'}</button>
        </form>
      </div>
    </section>
  );
}
