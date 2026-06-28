'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginAdmin(email, password);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    router.push('/admin');
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">

        <h2>Admin Sign In</h2>
        <p className="sub">Access the PESO Admin dashboard to manage employers, job postings, and reports.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field">
            <label>Admin Email <span className="req">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@peso.gov.ph" required autoComplete="email" />
          </div>
          <div className="field">
            <label>Password <span className="req">*</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 13 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="link-row" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            Need an admin account?{' '}
            <Link href="/admin/register" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </div>
          <button onClick={() => router.push('/')}>← Back to Public View</button>
        </div>
      </div>
    </div>
  );
}
