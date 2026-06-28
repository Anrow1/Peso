'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Tab { href: string; label: string; badge?: number; }

export default function SubNav() {
  const { role, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [pendingJobs, setPendingJobs] = useState(0);
  const [pendingEmployers, setPendingEmployers] = useState(0);
  const [pendingAdmins, setPendingAdmins] = useState(0);
  const [totalApps, setTotalApps] = useState(0);

  useEffect(() => {
    if (role !== 'admin') return;
    
    const unsub1 = onSnapshot(query(collection(db, 'jobs'), where('status', '==', 'pending')), s => setPendingJobs(s.size));
    const unsub2 = onSnapshot(query(collection(db, 'employers'), where('status', '==', 'pending')), s => setPendingEmployers(s.size));
    const unsub3 = onSnapshot(query(collection(db, 'admins'), where('status', '==', 'pending')), s => setPendingAdmins(s.size));
    const unsub4 = onSnapshot(collection(db, 'applications'), s => setTotalApps(s.size));

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [role]);

  if (loading) return <div className="subnav"><div className="subnav-inner" /></div>;

  // Hide subnav on login/register pages
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  if (isAuthPage && role === 'public') return <div className="subnav"><div className="subnav-inner" /></div>;

  let tabs: Tab[] = [];

  if (role === 'public') {
    tabs = [
      { href: '/', label: 'Home' },
      { href: '/listings', label: 'Job Listings' },
      { href: '/account', label: 'My Account' },
    ];
  } else if (role === 'employer') {
    tabs = [
      { href: '/employer', label: 'Dashboard' },
      { href: '/employer/post-job', label: 'Post a Job' },
      { href: '/employer/listings', label: 'Manage Listings' },
      { href: '/employer/inquiries', label: 'Applications' },
    ];
  } else if (role === 'admin') {
    tabs = [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/postings', label: 'Job Postings', badge: pendingJobs > 0 ? pendingJobs : undefined },
      { href: '/admin/employers', label: 'Employers', badge: pendingEmployers > 0 ? pendingEmployers : undefined },
      { href: '/admin/admins', label: 'Admins', badge: pendingAdmins > 0 ? pendingAdmins : undefined },
      { href: '/admin/applications', label: 'Applications', badge: totalApps > 0 ? totalApps : undefined },
      { href: '/admin/reports', label: 'Reports' },
    ];
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <div className="subnav">
      <div className="subnav-inner">
        {tabs.map(tab => {
          const active = pathname === tab.href || (
            tab.href !== '/' && 
            tab.href !== '/admin' && 
            tab.href !== '/employer' && 
            pathname.startsWith(tab.href + '/')
          );
          return (
            <Link key={tab.href} href={tab.href}>
              <button className={active ? 'active' : ''}>
                {tab.label}
                {tab.badge ? <span className="badge">{tab.badge}</span> : null}
              </button>
            </Link>
          );
        })}
        {(role === 'employer' || role === 'admin') && (
          <button
            onClick={handleLogout}
            style={{ marginLeft: 'auto', color: 'var(--red)', fontWeight: 700 }}
          >
            Logout
          </button>
        )}

      </div>
    </div>
  );
}
