'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/lib/types';
import { effectiveStatus } from '@/lib/data';
import JobCard from '@/components/JobCard';

export default function HomePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jobsQ = query(collection(db, 'jobs'), where('status', '==', 'active'), orderBy('postedAt', 'desc'));
    const unsub = onSnapshot(jobsQ, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Job));
      setJobs(data.filter(j => effectiveStatus(j) === 'active'));
      setLoading(false);
    });
    return unsub;
  }, []);

  function handleSearch() {
    router.push(`/listings?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Public Employment Service Office - Iloilo City</div>
        <h1>Find work near home. Hire from your community.</h1>
        <p>PESO Connect lists verified job openings from registered employers in your area — no fees, no middlemen, reviewed by your local Public Employment Service Office.</p>
        <div className="search-row">
          <input placeholder="Job title, company, or keyword..." value={q}
            onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <button onClick={handleSearch}>Search Jobs</button>
        </div>
        <div className="stat-row">
          <div><b>{jobs.length}</b><span>Active job openings</span></div>
          <div><b>{loading ? '—' : '✓'}</b><span>Verified employers</span></div>
        </div>
      </div>

      <div className="section-title">Recently posted</div>
      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>
        : jobs.slice(0, 5).map(job => (
            <JobCard key={job.id} job={job} href={`/jobs/${job.id}`} />
          ))
      }
      {!loading && jobs.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="btn btn-ghost" onClick={() => router.push('/listings')}>
            View all {jobs.length} listings &nbsp;→
          </button>
        </div>
      )}
      {!loading && jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-soft)' }}>
          No active job postings at the moment. Please check back later!
        </div>
      )}
    </>
  );
}
