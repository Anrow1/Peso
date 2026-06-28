'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/lib/types';
import { effectiveStatus, fmtDate, fmtMoney, MIN_WAGE } from '@/lib/data';
import StatusPill from '@/components/StatusPill';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/lib/useAuth';

export default function AdminPostingsPage() {
  const { showToast } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'jobs'), orderBy('postedAt', 'desc')), snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      setLoading(false);
    });
  }, []);

  async function approve(id: string) {
    await updateDoc(doc(db, 'jobs', id), { status: 'active' });
    showToast('Job approved and published!');
  }
  async function reject(id: string) {
    await updateDoc(doc(db, 'jobs', id), { status: 'rejected' });
    showToast('Job posting rejected.');
  }

  const pending = jobs.filter(j => j.status === 'pending');
  const others = jobs.filter(j => j.status !== 'pending');
  const minWageMonthly = MIN_WAGE * 22;
  const rejectJob = jobs.find(j => j.id === confirmReject);

  return (
    <>
      {confirmReject && rejectJob && (
        <ConfirmModal title="Reject Job Posting?" message={`Reject "${rejectJob.title}"? The employer will need to resubmit.`}
          confirmLabel="Reject" confirmClass="btn-danger"
          onConfirm={() => reject(confirmReject)} onClose={() => setConfirmReject(null)} />
      )}

      <div className="section-title">Manage Job Postings</div>
      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>
        : <>
          {pending.length > 0 && (
            <>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10 }}>Awaiting Review ({pending.length})</h3>
              {pending.map(j => {
                const belowMin = j.salaryType !== 'Negotiable' && j.salaryMin && j.salaryMin < minWageMonthly;
                return (
                  <div key={j.id} className="panel" style={{ marginBottom: 12, borderColor: '#EBD2A2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{j.ref}</div>
                        <strong style={{ fontSize: 16, cursor: 'pointer', color: 'var(--blue)' }} onClick={() => router.push(`/jobs/${j.id}`)}>{j.title}</strong>
                        <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{j.employerName} · {j.location} · {j.employmentType}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-green btn-sm" onClick={() => approve(j.id)}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmReject(j.id)}>Reject</button>
                      </div>
                    </div>
                    {belowMin && <div className="warn-box" style={{ marginTop: 10 }}>⚠ Salary ({fmtMoney(j.salaryMin)}/mo) appears below the regional minimum wage equivalent.</div>}
                  </div>
                );
              })}
            </>
          )}
          <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--ink-soft)', margin: '20px 0 10px' }}>All Postings</h3>
          <div className="panel">
            <table>
              <thead><tr><th>Reference</th><th>Title</th><th>Employer</th><th>Status</th><th>Deadline</th><th></th></tr></thead>
              <tbody>
                {others.map(j => (
                  <tr key={j.id}>
                    <td className="mono">{j.ref}</td><td>{j.title}</td><td>{j.employerName}</td>
                    <td><StatusPill status={effectiveStatus(j)} /></td>
                    <td>{fmtDate(j.deadline)}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => router.push(`/jobs/${j.id}`)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
    </>
  );
}
