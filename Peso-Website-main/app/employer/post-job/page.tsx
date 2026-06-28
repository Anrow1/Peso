'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { CATEGORIES, LOCATIONS, MIN_WAGE, fmtMoney, generateRef } from '@/lib/data';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contractual', 'Project-based'];
const WORK_SETUPS = ['On-site', 'Remote', 'Hybrid'];
const SALARY_TYPES = ['Fixed', 'Range', 'Negotiable'];

export default function PostJobPage() {
  const { firebaseUser, employerProfile, showToast } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [salaryType, setSalaryType] = useState('Fixed');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firebaseUser || !employerProfile) return;
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string)?.trim() ?? '';

    const title = get('title'), category = get('category'), desc = get('desc');
    const quals = get('quals'), employmentType = get('employmentType'), workSetup = get('workSetup');
    const location = get('location'), deadline = get('deadline'), howToApply = get('howToApply');
    const contactPerson = get('contactPerson');
    const salMin = get('salaryMin') ? Number(get('salaryMin')) : null;
    const salMax = get('salaryMax') ? Number(get('salaryMax')) : salMin;
    const vacancies = Number(get('vacancies')) || 1;

    if (!title || !category || !desc || !quals || !employmentType || !workSetup || !location || !deadline || !howToApply || !contactPerson) {
      setError('Please fill in all required fields.'); return;
    }
    setError('');

    const minWageMonthly = MIN_WAGE * 22;
    if (salaryType !== 'Negotiable' && salMin && salMin < minWageMonthly) {
      setWarning(`Salary (${fmtMoney(salMin)}/mo) appears below the regional minimum wage. Please review.`);
    } else setWarning('');

    setLoading(true);
    try {
      // Count existing jobs to generate reference
      const snap = await getDocs(collection(db, 'jobs'));
      const ref = generateRef(snap.size);

      await addDoc(collection(db, 'jobs'), {
        ref, employerId: firebaseUser.uid, employerName: employerProfile.name,
        title, category, desc, quals,
        employmentType, workSetup, salaryType, salaryMin: salMin, salaryMax: salMax,
        location, vacancies, deadline, howToApply, contactPerson,
        status: 'pending', postedAt: serverTimestamp(),
      });

      showToast('Job submitted! PESO Admin will review it shortly.');
      router.push('/employer/listings');
    } catch {
      setError('Failed to submit. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <div className="section-title">Post a Job Vacancy</div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: -10, marginBottom: 20 }}>
        Submitted postings go to <strong style={{ color: 'var(--amber)' }}>Pending</strong> until reviewed by PESO Admin — usually within 1–2 business days.
      </p>
      <form className="panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field full"><label>Job Title <span className="req">*</span></label><input name="title" required placeholder="e.g. Warehouse Supervisor" /></div>
          <div className="field"><label>Number of Vacancies <span className="req">*</span></label><input name="vacancies" type="number" min={1} required defaultValue={1} /></div>
          <div className="field"><label>Job Category <span className="req">*</span></label>
            <select name="category" required><option value="">Select category</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field full"><label>Job Description <span className="req">*</span></label><textarea name="desc" required placeholder="Duties and responsibilities..." /></div>
          <div className="field full"><label>Qualifications <span className="req">*</span></label><textarea name="quals" required placeholder="Education, experience, skills..." /></div>
          <div className="field"><label>Employment Type <span className="req">*</span></label>
            <select name="employmentType" required><option value="">Select type</option>{EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="field"><label>Work Setup <span className="req">*</span></label>
            <select name="workSetup" required><option value="">Select setup</option>{WORK_SETUPS.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="field"><label>Salary Type <span className="req">*</span></label>
            <select name="salaryType" value={salaryType} onChange={e => setSalaryType(e.target.value)} required>{SALARY_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          {salaryType !== 'Negotiable' && (
            <div className="field"><label>Salary Amount (₱/month)</label>
              <div style={{ display: 'flex', gap: 8 }}><input name="salaryMin" type="number" placeholder="Min" /><input name="salaryMax" type="number" placeholder="Max (if range)" /></div>
            </div>
          )}
          <div className="field"><label>Work Location <span className="req">*</span></label>
            <input name="location" type="text" placeholder="e.g. Quezon City, NCR" required />
          </div>
          <div className="field"><label>Application Deadline <span className="req">*</span></label><input name="deadline" type="date" required /></div>
          <div className="field full"><label>How to Apply <span className="req">*</span></label><textarea name="howToApply" required placeholder="Email, walk-in address..." /></div>
          <div className="field"><label>Contact Person <span className="req">*</span></label><input name="contactPerson" required /></div>
          <div className="field"><label>Contact Email <span className="req">*</span></label><input name="contactEmail" type="email" /></div>
        </div>
        {warning && <div className="warn-box" style={{ marginTop: 16 }}>⚠ {warning}</div>}
        {error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Submitting...</> : 'Submit for Approval'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/employer')}>Cancel</button>
        </div>
      </form>
    </>
  );
}
