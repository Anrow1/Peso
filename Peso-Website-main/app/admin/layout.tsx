'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (pathname === '/admin/login' || pathname === '/admin/register') return;
    if (role !== 'admin') {
      router.replace('/admin/login');
    }
  }, [role, loading, router, pathname]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <span className="spinner spinner-blue" style={{ width: 28, height: 28 }} />
    </div>
  );

  if (pathname === '/admin/login' || pathname === '/admin/register') return <>{children}</>;
  if (role !== 'admin') return null;

  return <>{children}</>;
}
