'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

export default function EmployerLoginPage() {
  const { loginEmployer } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setPending(false);
    setLoading(true);
    const res = await loginEmployer(email, password);
    setLoading(false);
    if (res.pendingApproval) { setPending(true); return; }
    if (res.error) { setError(res.error); return; }
    router.push('/employer');
  }

  if (pending) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <div className="pending-screen">
            <div className="pending-icon">⏳</div>
            <h2>Awaiting PESO Approval</h2>
            <p>
              Your employer registration has been received and is currently under review by the
              PESO Admin team. You will be notified by email once your account is approved — usually
              within 1–2 business days.
            </p>
            <p style={{ marginTop: 16 }}>
              If you have questions, please contact your local PESO office directly.
            </p>
            <button className="btn btn-ghost" style={{ marginTop: 24 }} onClick={() => router.push('/')}>
              Go to Public View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">


        <h2>Employer Sign In</h2>
        <p className="sub">Log in to manage your job postings and review applications.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email Address <span className="req">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" />
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

        <div className="link-row">
          Don&apos;t have an account?{' '}
          <button onClick={() => router.push('/employer/register')}>Register your company</button>
        </div>
        <div className="link-row" style={{ marginTop: 8 }}>
          <button onClick={() => router.push('/')}>← Back to Public View</button>
        </div>
      </div>
    </div>
  );
}
