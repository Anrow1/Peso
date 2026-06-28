'use client';

import { Suspense } from 'react';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/lib/types';
import { effectiveStatus, filterAndSortJobs, CATEGORIES, LOCATIONS } from '@/lib/data';
import { Filters } from '@/lib/types';
import JobCard from '@/components/JobCard';
import EmptyState from '@/components/EmptyState';

import { useSearchParams } from 'next/navigation';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contractual', 'Project-based'];
const WORK_SETUPS = ['On-site', 'Remote', 'Hybrid'];

const emptyFilters: Filters = { q: '', category: '', location: '', employmentType: '', workSetup: '' };

function ListingsContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, q: searchParams.get('q') || '' });
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jobsQ = query(collection(db, 'jobs'), where('status', '==', 'active'), orderBy('postedAt', 'desc'));
    return onSnapshot(jobsQ, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      setLoading(false);
    });
  }, []);

  function setFilter(key: keyof Filters, val: string) {
    setFilters(f => ({ ...f, [key]: val }));
  }

  const list = filterAndSortJobs(jobs, filters, sort);

  return (
    <>
      <div className="section-title">Job Listings</div>
      <div className="grid-2">
        <div className="panel">
          <h3>Filter results</h3>
          <div className="filter-group"><label>Keyword</label>
            <input value={filters.q} onChange={e => setFilter('q', e.target.value)} placeholder="Title, company..." />
          </div>
          <div className="filter-group"><label>Category</label>
            <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group"><label>Location</label>
            <select value={filters.location} onChange={e => setFilter('location', e.target.value)}>
              <option value="">All locations</option>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="filter-group"><label>Employment Type</label>
            <select value={filters.employmentType} onChange={e => setFilter('employmentType', e.target.value)}>
              <option value="">Any type</option>
              {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="filter-group"><label>Work Setup</label>
            <select value={filters.workSetup} onChange={e => setFilter('workSetup', e.target.value)}>
              <option value="">Any setup</option>
              {WORK_SETUPS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setFilters(emptyFilters)}>Clear filters</button>
        </div>

        <div>
          <div className="toolbar">
            <span className="count">{list.length} open job{list.length !== 1 ? 's' : ''} found</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Sort: Newest</option>
              <option value="deadline">Sort: Deadline Soonest</option>
              <option value="slots">Sort: Most Slots</option>
            </select>
          </div>
          {loading
            ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>
            : list.length
              ? list.map(job => <JobCard key={job.id} job={job} href={`/jobs/${job.id}`} />)
              : <EmptyState title="No matching jobs" sub="Try widening your filters or searching a different keyword." />
          }
        </div>
      </div>
    </>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" /></div>}>
      <ListingsContent />
    </Suspense>
  );
}
