'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

const PUBLIC_PATHS = ['/employer/login', '/employer/register'];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (loading || isPublicPath) return;
    if (role !== 'employer') {
      router.replace('/employer/login');
    }
  }, [role, loading, router, isPublicPath, pathname]);

  if (loading && !isPublicPath) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <span className="spinner spinner-blue" style={{ width: 28, height: 28 }} />
    </div>
  );

  if (isPublicPath) return <>{children}</>;
  if (role !== 'employer') return null;

  return <>{children}</>;
}
