import { Job, Filters } from './types';

export const CATEGORIES = [
  'Information Technology', 'Admin & Clerical', 'Sales & Marketing',
  'Healthcare', 'Manufacturing', 'Skilled Trades', 'Hospitality & Tourism',
  'BPO / Customer Service',
];

export const LOCATIONS = [
  'Lucena City, Quezon', 'Calauag, Quezon', 'Quezon City, NCR',
  'Manila, NCR', 'Cebu City, Cebu', 'Davao City, Davao del Sur',
];

export const MIN_WAGE = 470; // daily minimum wage for validation

export function fmtMoney(n: number | null): string {
  if (n == null) return '';
  return '₱' + n.toLocaleString();
}

export function fmtDate(d: any): string {
  if (!d) return '—';
  let dateObj: Date;
  if (typeof d === 'string') {
    dateObj = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
  } else if (d && d.toDate && typeof d.toDate === 'function') {
    dateObj = d.toDate();
  } else if (d instanceof Date) {
    dateObj = d;
  } else {
    dateObj = new Date(d);
  }
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  return dateObj.toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function formatSalary(job: Pick<Job, 'salaryType' | 'salaryMin' | 'salaryMax'>): string {
  if (job.salaryType === 'Negotiable') return 'Negotiable';
  if (job.salaryMin === job.salaryMax) return fmtMoney(job.salaryMin);
  return `${fmtMoney(job.salaryMin)} – ${fmtMoney(job.salaryMax)}`;
}

export function effectiveStatus(job: Job): string {
  if (job.status === 'active') {
    const deadline = new Date(job.deadline + 'T00:00:00');
    if (deadline < new Date()) return 'expired';
  }
  return job.status;
}

export function filterAndSortJobs(jobs: Job[], filters: Filters, sort: string): Job[] {
  let list = jobs.filter(j => effectiveStatus(j) === 'active');

  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.employerName.toLowerCase().includes(q) ||
      j.desc.toLowerCase().includes(q)
    );
  }
  if (filters.category) list = list.filter(j => j.category === filters.category);
  if (filters.location) list = list.filter(j => j.location === filters.location);
  if (filters.employmentType) list = list.filter(j => j.employmentType === filters.employmentType);
  if (filters.workSetup) list = list.filter(j => j.workSetup === filters.workSetup);

  if (sort === 'newest') list = [...list].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  if (sort === 'deadline') list = [...list].sort((a, b) => a.deadline.localeCompare(b.deadline));
  if (sort === 'slots') list = [...list].sort((a, b) => b.vacancies - a.vacancies);
  return list;
}

export function generateRef(count: number): string {
  const year = new Date().getFullYear();
  return `PESO-${year}-${String(count + 1).padStart(4, '0')}`;
}
