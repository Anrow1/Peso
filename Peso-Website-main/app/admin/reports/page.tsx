'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/lib/types';

export default function AdminReportsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appCount, setAppCount] = useState(0);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'jobs'), snap => setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job))));
    const unsub2 = onSnapshot(collection(db, 'applications'), snap => setAppCount(snap.size));
    return () => { unsub1(); unsub2(); };
  }, []);

  const byCategory: Record<string, number> = {};
  jobs.forEach(j => { byCategory[j.category] = (byCategory[j.category] || 0) + 1; });
  const maxCat = Math.max(...Object.values(byCategory), 1);

  function exportCSV() {
    const rows = [
      ['Reference', 'Title', 'Employer', 'Category', 'Location', 'Status', 'Vacancies', 'Posted'],
      ...jobs.map(j => [j.ref, j.title, j.employerName, j.category, j.location, j.status, j.vacancies, j.postedAt]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'peso-jobs-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="section-title">Reports</div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>Jobs by Category</h3>
        {Object.entries(byCategory).map(([cat, count]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 200, fontSize: 13, color: 'var(--ink-soft)', flexShrink: 0 }}>{cat}</div>
            <div style={{ flex: 1, background: 'var(--paper-deep)', borderRadius: 5, height: 18, overflow: 'hidden' }}>
              <div style={{ background: 'var(--blue)', height: '100%', width: `${(count / maxCat) * 100}%`, transition: 'width .4s' }} />
            </div>
            <div style={{ width: 24, fontSize: 13, fontWeight: 700 }}>{count}</div>
          </div>
        ))}
      </div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>Summary</h3>
        <div className="kv"><span>Total applications</span><span>{appCount}</span></div>
        <div className="kv"><span>Total jobs</span><span>{jobs.length}</span></div>
        <div className="kv" style={{ borderBottom: 'none' }}><span>Jobs filled</span><span>{jobs.filter(j => j.status === 'filled').length}</span></div>
      </div>
      <button className="btn btn-ghost" onClick={exportCSV}>📥 Export as CSV</button>
    </>
  );
}
