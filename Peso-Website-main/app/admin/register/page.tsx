'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function AdminRegisterPage() {
  const { registerAdmin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await registerAdmin(email, password);
    setLoading(false);
    
    if (res.error) { 
      setError(res.error); 
      return; 
    }
    
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <div className="pending-screen">
            <div className="pending-icon">✓</div>
            <h2>Registration Submitted</h2>
            <p>
              Your PESO Admin account has been registered and is now pending review.
            </p>
            <p style={{ marginTop: 12 }}>
              For security purposes, new administrative accounts must be approved by an existing admin before they can access the dashboard.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => router.push('/admin/login')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2>Admin Registration</h2>
        <p className="sub">Register a new PESO Admin account to manage the platform.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field">
            <label>Admin Email <span className="req">*</span></label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@peso.gov.ph" 
              required 
            />
          </div>
          <div className="field">
            <label>Password <span className="req">*</span></label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 13 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Registering...</> : 'Create Admin Account'}
          </button>
        </form>

        <div className="link-row" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            Already have an admin account?{' '}
            <Link href="/admin/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
          <button onClick={() => router.push('/')}>← Back to Public View</button>
        </div>
      </div>
    </div>
  );
}
