'use client';

import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLoginGate from '../../components/admin/AdminLoginGate';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const { verified, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="center" style={{ padding: 120, background: 'var(--ivory)', minHeight: '100vh' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!verified) return <AdminLoginGate />;

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">{children}</div>
    </div>
  );
}
