'use client';

import { useRouter } from 'next/navigation';
import { Job } from '@/lib/types';
import { effectiveStatus, fmtDate, formatSalary } from '@/lib/data';
import StatusPill from './StatusPill';

interface Props {
  job: Job;
  href?: string;
}

export default function JobCard({ job, href }: Props) {
  const router = useRouter();
  const st = effectiveStatus(job);

  return (
    <div className="job-card" onClick={() => href && router.push(href)}
      tabIndex={0} role="button" onKeyDown={e => e.key === 'Enter' && href && router.push(href)}>
      <div className="ticket-stub">
        <span className="ref mono">{job.ref}</span>
      </div>
      <div className="job-card-body">
        <div className="job-card-top">
          <div>
            <h4>{job.title}</h4>
            <div className="co">{job.employerName} · {job.location}</div>
          </div>
          <StatusPill status={st} />
        </div>
        <div className="tag-row">
          <span className="tag">{job.employmentType}</span>
          <span className="tag">{job.workSetup}</span>
          <span className="tag">{job.category}</span>
        </div>
        <div className="meta-row">
          <span>💰 {formatSalary(job)}</span>
          <span>📅 Deadline: {fmtDate(job.deadline)}</span>
          <span>👥 {job.vacancies} slot{job.vacancies !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
