'use client';

export default function AccountPage() {
  return (
    <>
      <div className="section-title">My Account</div>
      <div className="panel">
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.7 }}>
          Public jobseeker accounts are not required to view or apply for jobs on PESO Connect.
          You can apply directly from any job listing — your application and resume are sent
          directly to the employer.
        </p>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>
          To post jobs, register as an employer using the link in the navigation bar.
        </p>
      </div>
    </>
  );
}
