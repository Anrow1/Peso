'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employer, Job, Application } from '@/lib/types';
import StatusPill from '@/components/StatusPill';
import { effectiveStatus } from '@/lib/data';

export default function EmployerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employerId = params.id as string;

  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employerId) return;

    let unsubJobs = () => {};
    let unsubApps = () => {};

    // Fetch Employer
    getDoc(doc(db, 'employers', employerId)).then(snap => {
      if (snap.exists()) {
        setEmployer({ id: snap.id, ...snap.data() } as Employer);
      }
    });

    // Fetch Jobs
    const qJobs = query(collection(db, 'jobs'), where('employerId', '==', employerId));
    unsubJobs = onSnapshot(qJobs, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    });

    // Fetch Applications
    const qApps = query(collection(db, 'applications'), where('employerId', '==', employerId));
    unsubApps = onSnapshot(qApps, snap => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
      setLoading(false);
    });

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [employerId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>;
  }

  if (!employer) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-soft)' }}>Employer not found.</div>;
  }

  const activeJobsCount = jobs.filter(j => effectiveStatus(j) === 'active').length;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={() => router.push('/admin/employers')}>← Back to Employers</button>
      </div>

      <div className="panel" style={{ marginBottom: 24, padding: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 4 }}>{employer.name}</h2>
            <div style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>{employer.industry}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', fontSize: 14 }}>
              <div><strong>Email:</strong> {employer.email}</div>
              <div><strong>Phone:</strong> {employer.phone || 'N/A'}</div>
              <div><strong>Contact Person:</strong> {employer.contact}</div>
              <div><strong>Permit No:</strong> <span className="mono">{employer.permit}</span></div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {employer.address}</div>
            </div>
          </div>
          <StatusPill status={employer.status === 'active' ? 'active' : employer.status === 'pending' ? 'pending' : 'expired'} />
        </div>
      </div>

      <div className="section-title">Performance Statistics</div>
      <div className="stat-cards" style={{ marginBottom: 32 }}>
        <div className="stat-card"><b>{jobs.length}</b><span>Total Job Postings</span></div>
        <div className="stat-card"><b>{activeJobsCount}</b><span>Active Jobs</span></div>
        <div className="stat-card"><b>{applications.length}</b><span>Total Applications Received</span></div>
      </div>

      <div className="section-title">Job Postings</div>
      <div className="panel">
        {!jobs.length ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: 20 }}>No jobs posted by this employer yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Ref</th><th>Title & Details</th><th>Status</th><th>Applicants</th></tr>
            </thead>
            <tbody>
              {jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()).map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id).length;
                return (
                  <tr key={job.id}>
                    <td className="mono" style={{ fontSize: 12 }}>{job.ref}</td>
                    <td>
                      <strong>{job.title}</strong>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                        {job.category} · {job.employmentType} · {job.workSetup}
                      </div>
                    </td>
                    <td><StatusPill status={effectiveStatus(job)} /></td>
                    <td><b>{jobApps}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
