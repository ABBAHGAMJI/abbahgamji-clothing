'use client';

// The backend has no admin accounts/roles — a single shared secret
// (ADMIN_TOKEN from the backend's .env) unlocks every requireAdmin route.
// This context just holds that token in localStorage and verifies it
// against a real admin endpoint before trusting it.

import { createContext, useContext, useEffect, useState } from 'react';
import { customersApi } from '../lib/api';

const AdminAuthContext = createContext(null);
const ADMIN_KEY = 'abg_admin_token_v1';

export function AdminAuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_KEY);
    if (stored) {
      verify(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(tok) {
    try {
      await customersApi.list(tok); // any requireAdmin route works as a check
      setAdminToken(tok);
      setVerified(true);
      return true;
    } catch {
      localStorage.removeItem(ADMIN_KEY);
      setAdminToken(null);
      setVerified(false);
      return false;
    }
  }

  async function loginAsAdmin(tok) {
    const ok = await verify(tok);
    if (ok) localStorage.setItem(ADMIN_KEY, tok);
    return ok;
  }

  function logoutAdmin() {
    localStorage.removeItem(ADMIN_KEY);
    setAdminToken(null);
    setVerified(false);
  }

  const value = { adminToken, verified, loading, loginAsAdmin, logoutAdmin };
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
