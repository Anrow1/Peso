'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { CATEGORIES } from '@/lib/data';

const STEPS = ['Company Info', 'Account Setup'];

export default function EmployerRegisterPage() {
  const { registerEmployer } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', industry: '', address: '', contact: '', phone: '', permit: '',
    email: '', password: '', confirmPassword: '',
  });

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function validateStep0() {
    if (!form.name || !form.industry || !form.address || !form.contact || !form.permit) {
      setError('Please fill in all required fields.'); return false;
    }
    setError(''); return true;
  }

  function validateStep1() {
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.'); return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return false;
    }
    setError(''); return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 0) {
      if (validateStep0()) setStep(1);
      return;
    }
    if (!validateStep1()) return;

    setLoading(true);
    const res = await registerEmployer({
      name: form.name, industry: form.industry, address: form.address,
      contact: form.contact, phone: form.phone, permit: form.permit,
      email: form.email, password: form.password,
    });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <div className="pending-screen">
            <div className="pending-icon">🎉</div>
            <h2>Registration Submitted!</h2>
            <p>
              Thank you, <strong>{form.name}</strong>! Your employer registration has been submitted
              and is now pending review by the PESO Admin team.
            </p>
            <p style={{ marginTop: 12 }}>
              Once approved, you can log in with your email and password to start posting job vacancies.
              You&apos;ll be notified by email within 1–2 business days.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => router.push('/employer/login')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: 540 }}>


        {/* Step indicators */}
        <div className="steps">
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`} data-num={i + 1}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', margin: '0 auto 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: i < step ? 'var(--green)' : i === step ? 'var(--blue)' : 'var(--paper-deep)',
                    color: i <= step ? '#fff' : 'var(--ink-soft)',
                    border: `2px solid ${i < step ? 'var(--green)' : i === step ? 'var(--blue)' : 'var(--line)'}`,
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: i === step ? 'var(--blue)' : 'var(--ink-soft)' }}>{label}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 40, height: 2, background: i < step ? 'var(--green)' : 'var(--line)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 0 && (
            <div className="form-stack">
              <h2 style={{ marginBottom: 4 }}>Company Information</h2>
              <p className="sub" style={{ marginBottom: 16 }}>Tell us about your business. PESO will verify this information before approving your account.</p>
              <div className="field">
                <label>Company Name <span className="req">*</span></label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. ABC Corporation" required />
              </div>
              <div className="field">
                <label>Industry <span className="req">*</span></label>
                <select value={form.industry} onChange={e => set('industry', e.target.value)} required>
                  <option value="">Select industry</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Business Address <span className="req">*</span></label>
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full company address" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Contact Person <span className="req">*</span></label>
                  <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="HR Manager name" required />
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="09xxxxxxxxx" />
                </div>
              </div>
              <div className="field">
                <label>Business Permit / License No. <span className="req">*</span></label>
                <input value={form.permit} onChange={e => set('permit', e.target.value)} placeholder="e.g. QZ-2026-00123" required />
                <p className="hint">Used by PESO to verify your business registration.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form-stack">
              <h2 style={{ marginBottom: 4 }}>Account Setup</h2>
              <p className="sub" style={{ marginBottom: 16 }}>Create login credentials for your employer account.</p>
              <div className="field">
                <label>Email Address <span className="req">*</span></label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="hr@company.com" required autoComplete="email" />
              </div>
              <div className="field">
                <label>Password <span className="req">*</span></label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 6 characters" required autoComplete="new-password" />
              </div>
              <div className="field">
                <label>Confirm Password <span className="req">*</span></label>
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat your password" required autoComplete="new-password" />
              </div>
              <div className="warn-box">
                ⏳ After registration, your account will be <strong>pending approval</strong> by PESO Admin before you can log in and post jobs.
              </div>
            </div>
          )}

          {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: 13 }} disabled={loading}>
              {loading
                ? <><span className="spinner" /> Submitting...</>
                : step === 0 ? 'Continue →' : 'Submit Registration'
              }
            </button>
          </div>
        </form>

        <div className="link-row">
          Already have an account?{' '}
          <button onClick={() => router.push('/employer/login')}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
