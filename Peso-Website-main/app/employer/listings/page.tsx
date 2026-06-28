'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { Job } from '@/lib/types';
import { effectiveStatus, fmtDate } from '@/lib/data';
import StatusPill from '@/components/StatusPill';

export default function EmployerListingsPage() {
  const { firebaseUser, showToast } = useAuth();
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

  async function markFilled(id: string) {
    await updateDoc(doc(db, 'jobs', id), { status: 'filled' });
    showToast('Job marked as filled.');
  }

  async function repost(id: string) {
    await updateDoc(doc(db, 'jobs', id), { status: 'pending', deadline: '2026-12-31' });
    showToast('Job reposted and sent for review.');
  }

  return (
    <>
      <div className="section-title">Manage Listings</div>
      <div className="panel">
        {loading
          ? <div style={{ textAlign: 'center', padding: 30 }}><span className="spinner spinner-blue" style={{ width: 24, height: 24 }} /></div>
          : <table>
              <thead><tr><th>Reference</th><th>Title</th><th>Status</th><th>Deadline</th><th>Actions</th></tr></thead>
              <tbody>
                {jobs.map(j => {
                  const st = effectiveStatus(j);
                  return (
                    <tr key={j.id}>
                      <td className="mono">{j.ref}</td>
                      <td>{j.title}</td>
                      <td><StatusPill status={st} /></td>
                      <td>{fmtDate(j.deadline)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/jobs/${j.id}`)}>View</button>
                          {st === 'active' && <button className="btn btn-ghost btn-sm" onClick={() => markFilled(j.id)}>Mark Filled</button>}
                          {st === 'expired' && <button className="btn btn-green btn-sm" onClick={() => repost(j.id)}>Repost</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        }
      </div>
    </>
  );
}
