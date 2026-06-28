'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job, Employer } from '@/lib/types';
import { effectiveStatus } from '@/lib/data';

export default function AdminDashPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'jobs'), snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    });
    const unsub2 = onSnapshot(query(collection(db, 'employers'), orderBy('createdAt', 'desc')), snap => {
      setEmployers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Employer)));
      setLoading(false);
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const activeJobs = jobs.filter(j => effectiveStatus(j) === 'active').length;
  const pendingApprovals = jobs.filter(j => j.status === 'pending').length + employers.filter(e => e.status === 'pending').length;

  return (
    <>
      <div className="section-title">PESO Admin Dashboard</div>
      <div className="stat-cards">
        <div className="stat-card"><b>{jobs.length}</b><span>Total job postings</span></div>
        <div className="stat-card"><b>{activeJobs}</b><span>Active jobs</span></div>
        <div className="stat-card"><b style={{ color: pendingApprovals > 0 ? 'var(--amber)' : 'var(--blue)' }}>{pendingApprovals}</b><span>Pending approvals</span></div>
        <div className="stat-card"><b>{employers.length}</b><span>Registered employers</span></div>
      </div>
      {loading && <div style={{ textAlign: 'center', padding: 30 }}><span className="spinner spinner-blue" style={{ width: 24, height: 24 }} /></div>}
    </>
  );
}
