'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState('password'); // 'password' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState('');
  const [devMagicUrl, setDevMagicUrl] = useState('');

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setError('');
    setMagicSent('');
    setDevMagicUrl('');
    setLoading(true);
    try {
      const res = await authApi.requestMagicLink(email);
      setMagicSent(res.message);
      if (res.devMagicUrl) setDevMagicUrl(res.devMagicUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="form-card">
        <h1>Welcome Back</h1>

        <div className="chip-row" style={{ marginBottom: 24 }}>
          <button type="button" className={`chip ${mode === 'password' ? 'active' : ''}`} onClick={() => setMode('password')}>Password</button>
          <button type="button" className={`chip ${mode === 'magic' ? 'active' : ''}`} onClick={() => setMode('magic')}>Email Link</button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {magicSent && <div className="alert success">{magicSent}</div>}
        {devMagicUrl && (
          <div className="alert info">
            No email sending configured on the backend yet — use this link directly: <br />
            <a href={devMagicUrl} style={{ color: 'var(--warn)', fontWeight: 600, wordBreak: 'break-all' }}>{devMagicUrl}</a>
          </div>
        )}

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-solid btn-block" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink}>
            <div className="field">
              <label htmlFor="magic-email">Email</label>
              <input id="magic-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-solid btn-block" disabled={loading}>{loading ? 'Sending…' : 'Send Login Link'}</button>
          </form>
        )}

        <p className="form-alt">Don&apos;t have an account? <Link href="/register">Create one</Link></p>
      </div>
    </section>
  );
}
