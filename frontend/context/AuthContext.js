'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'abg_token_v1';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async (tok) => {
    try {
      const me = await authApi.me(tok);
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      loadMe(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadMe]);

  function saveSession(tok) {
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    return loadMe(tok);
  }

  async function login(email, password) {
    const res = await authApi.login(email, password);
    await saveSession(res.token);
    return res;
  }

  async function register(name, email, password) {
    const res = await authApi.register(name, email, password);
    await saveSession(res.token);
    return res;
  }

  async function loginWithMagicToken(magicToken) {
    const res = await authApi.magicLogin(magicToken);
    await saveSession(res.token);
    return res;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function refresh() {
    if (token) await loadMe(token);
  }

  const value = { token, user, loading, login, register, loginWithMagicToken, logout, refresh };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
