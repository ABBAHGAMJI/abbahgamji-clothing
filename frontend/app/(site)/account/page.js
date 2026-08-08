'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../lib/api';
import MeasurementsForm from '../../../components/MeasurementsForm';

export default function AccountPage() {
  const router = useRouter();
  const { user, token, loading, logout, refresh } = useAuth();
  const [measurements, setMeasurements] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.measurements) setMeasurements(user.measurements);
  }, [user]);

  async function handleSaveMeasurements(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await authApi.updateMeasurements(token, measurements);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <div className="center" style={{ padding: 100 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  }

  return (
    <>
      <div className="page-hero">
        <h1>My Account</h1>
        <p>Welcome back, {user.name}.</p>
      </div>
      <section>
        <div className="account-layout">
          <div className="account-nav">
            <a className="active">Overview</a>
            <a href="/track">Track An Order</a>
            <button className="btn btn-outline btn-sm mt-24" onClick={() => { logout(); router.push('/'); }}>Log Out</button>
          </div>

          <div>
            <div className="stat-grid mb-24">
              <div className="stat-card">
                <div className="stat-label">Loyalty Points</div>
                <div className="stat-value">{user.loyaltyPoints || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Points Value</div>
                <div className="stat-value">₦{((user.loyaltyPoints || 0) * 5).toLocaleString()}</div>
              </div>
            </div>

            <div className="card mb-24">
              <h3 className="mb-16">Profile</h3>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>

            <div className="card">
              <h3 className="mb-8">Your Tailor&apos;s Inscription</h3>
              <p className="muted mb-16">Save your measurements once — every made-to-measure order will offer to reuse them.</p>
              {saved && <div className="alert success">Measurements saved.</div>}
              <form onSubmit={handleSaveMeasurements}>
                <MeasurementsForm values={measurements} onChange={setMeasurements} />
                <button className="btn btn-dark mt-24" disabled={saving}>{saving ? 'Saving…' : 'Save Measurements'}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
