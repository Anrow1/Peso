'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { Application } from '@/lib/types';
import { fmtFileSize } from '@/lib/data';
import EmptyState from '@/components/EmptyState';

export default function EmployerInquiriesPage() {
  const { firebaseUser } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(
      collection(db, 'applications'),
      where('employerId', '==', firebaseUser.uid),
      orderBy('appliedAt', 'desc')
    );
    return onSnapshot(q, snap => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
      setLoading(false);
    });
  }, [firebaseUser]);

  return (
    <>
      <div className="section-title">Applications ({apps.length})</div>
      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>
        : !apps.length
          ? <EmptyState title="No applications yet" sub="Applications from jobseekers will appear here once they apply to your postings." />
          : apps.map(app => (
              <div key={app.id} className="panel" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{app.applicantName}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                      {app.email} {app.phone ? `· ${app.phone}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {app.appliedAt ? new Date(((app.appliedAt as unknown) as { seconds: number }).seconds * 1000).toLocaleDateString('en-PH', { dateStyle: 'medium' }) : 'Just now'}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '8px 0 4px' }}>
                  Applied for: <strong style={{ color: 'var(--ink)' }}>{app.jobTitle}</strong>{' '}
                  <span className="mono" style={{ fontSize: 12 }}>({app.jobRef})</span>
                </div>

                {app.coverLetter && (
                  <p style={{ fontSize: 13.5, color: 'var(--ink)', margin: '10px 0 12px', lineHeight: 1.6, background: 'var(--paper)', padding: '10px 14px', borderRadius: 7 }}>
                    {app.coverLetter}
                  </p>
                )}

                {app.resumeURL && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div className="file-chip">
                      <span>📄</span>
                      <span className="chip-name">{app.fileName}</span>
                      <span style={{ opacity: .7, fontSize: 12 }}>({fmtFileSize(app.fileSize)})</span>
                    </div>
                    <a href={app.resumeURL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                      View Resume ↗
                    </a>
                  </div>
                )}
              </div>
            ))
      }
    </>
  );
}
