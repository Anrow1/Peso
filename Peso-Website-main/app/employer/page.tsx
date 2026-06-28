'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { Job } from '@/lib/types';
import { effectiveStatus, fmtDate } from '@/lib/data';
import StatusPill from '@/components/StatusPill';

export default function EmployerDashPage() {
  const { employerProfile, firebaseUser } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(collection(db, 'jobs'), where('employerId', '==', firebaseUser.uid), orderBy('postedAt', 'desc'));
    return onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      setLoading(false);
    });
  }, [firebaseUser]);

  const counts = {
    total: jobs.length,
    active: jobs.filter(j => effectiveStatus(j) === 'active').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    expired: jobs.filter(j => effectiveStatus(j) === 'expired').length,
  };

  return (
    <>
      <div className="section-title">Welcome back, {employerProfile?.name}</div>
      <div className="stat-cards">
        <div className="stat-card"><b>{counts.total}</b><span>Total postings</span></div>
        <div className="stat-card"><b>{counts.active}</b><span>Active</span></div>
        <div className="stat-card"><b>{counts.pending}</b><span>Pending approval</span></div>
        <div className="stat-card"><b>{counts.expired}</b><span>Expired</span></div>
      </div>
      <button className="btn btn-primary" style={{ marginBottom: 24 }} onClick={() => router.push('/employer/post-job')}>
        + Post a New Job
      </button>
      <div className="panel">
        <h3>Your recent postings</h3>
        {loading
          ? <div style={{ textAlign: 'center', padding: 30 }}><span className="spinner spinner-blue" style={{ width: 24, height: 24 }} /></div>
          : jobs.slice(0, 5).map(j => (
              <div key={j.id} className="job-card" onClick={() => router.push(`/jobs/${j.id}`)}>
                <div className="ticket-stub"><span className="ref mono">{j.ref}</span></div>
                <div className="job-card-body">
                  <div className="job-card-top"><h4>{j.title}</h4><StatusPill status={effectiveStatus(j)} /></div>
                  <div className="meta-row"><span>👥 {j.vacancies} slots</span><span>📅 Deadline {fmtDate(j.deadline)}</span></div>
                </div>
              </div>
            ))
        }
      </div>
    </>
  );
}
