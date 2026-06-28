'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { Job } from '@/lib/types';
import { effectiveStatus, fmtDate, formatSalary } from '@/lib/data';
import StatusPill from '@/components/StatusPill';
import ApplicationModal from '@/components/ApplicationModal';
import EmptyState from '@/components/EmptyState';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role, showToast } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);

  const jobId = params.id as string;

  useEffect(() => {
    if (!jobId) return;
    getDoc(doc(db, 'jobs', jobId)).then(snap => {
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() } as Job);
      setLoading(false);
    });
  }, [jobId]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>;
  if (!job) return <EmptyState title="Job not found" sub="This listing may have been removed." />;

  const st = effectiveStatus(job);
  const backHref = role === 'admin' ? '/admin/postings' : role === 'employer' ? '/employer/listings' : '/listings';

  function handleSuccess() {
    setShowApply(false);
    setApplied(true);
    showToast('Application submitted successfully!');
  }

  return (
    <>
      {showApply && <ApplicationModal job={job} onClose={() => setShowApply(false)} onSuccess={handleSuccess} />}

      <button className="back-link" onClick={() => router.push(backHref)}>← Back</button>

      <div className="detail-head">
        <div className="refno mono">Reference No. {job.ref} &nbsp;·&nbsp; Posted {fmtDate(job.postedAt)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <h2>{job.title}</h2>
            <div className="co">{job.employerName}</div>
          </div>
          <StatusPill status={st} />
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="section-block"><h3>Job Description</h3><p>{job.desc}</p></div>
          <div className="section-block"><h3>Qualifications</h3><p>{job.quals}</p></div>
          <div className="section-block">
            <h3>How to Apply</h3>
            <p>{job.howToApply}</p>
            <p style={{ marginTop: 8 }}>Contact: <strong style={{ color: 'var(--ink)' }}>{job.contactPerson}</strong></p>
          </div>
        </div>

        <div>
          <div className="side-card">
            <div className="kv"><span>Vacancies</span><span>{job.vacancies}</span></div>
            <div className="kv"><span>Employment Type</span><span>{job.employmentType}</span></div>
            <div className="kv"><span>Work Setup</span><span>{job.workSetup}</span></div>
            <div className="kv"><span>Salary</span><span>{formatSalary(job)}</span></div>
            <div className="kv"><span>Location</span><span>{job.location}</span></div>
            <div className="kv" style={{ borderBottom: 'none' }}><span>Deadline</span><span>{fmtDate(job.deadline)}</span></div>
          </div>

          {role === 'public' && st === 'active' && (
            applied
              ? <div className="applied-badge" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>✓ Application Submitted</div>
              : <button className="btn btn-primary" style={{ width: '100%', marginBottom: 8, padding: 13 }} onClick={() => setShowApply(true)}>
                  Apply for this Job
                </button>
          )}

          {role !== 'public' && (
            <div className="warn-box" style={{ marginBottom: 14, fontSize: 12, textAlign: 'center' }}>
              Viewing as {role}. Job seekers will see an "Apply" button here.
            </div>
          )}

          <div className="side-card" style={{ marginTop: role === 'public' ? 8 : 14 }}>
            <h3 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8 }}>About the Employer</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
              {job.employerName} is a PESO-verified employer posting job openings through the Public Employment Service Office.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
