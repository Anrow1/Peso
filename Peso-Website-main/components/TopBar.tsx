'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const { role, employerProfile, loading } = useAuth();
  const router = useRouter();

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div className="brand-mark">P</div>
          <div className="brand-text">
            <strong>PESO Connect</strong>
            <span>Public Employment Service Office</span>
          </div>
        </div>

        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="role-switch">
              <button onClick={() => router.push('/')} className={role === 'public' ? 'active' : ''}>Public View</button>
              <button onClick={() => router.push('/employer')} className={role === 'employer' ? 'active' : ''}>Employer Portal</button>
              <button onClick={() => router.push('/admin')} className={role === 'admin' ? 'active' : ''}>PESO Admin</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
