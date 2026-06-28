export interface Employer {
  id: string;           // Firestore doc ID = Firebase Auth UID
  name: string;
  industry: string;
  address: string;
  contact: string;
  email: string;
  phone?: string;
  permit: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  createdAt?: string;
}

export interface Admin {
  id: string;
  email: string;
  displayName: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt?: string;
}

export interface Job {
  id: string;           // Firestore doc ID
  ref: string;          // e.g. PESO-2026-0001
  employerId: string;   // Firebase Auth UID of employer
  employerName: string;
  title: string;
  category: string;
  desc: string;
  quals: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contractual' | 'Project-based';
  workSetup: 'On-site' | 'Remote' | 'Hybrid';
  salaryType: 'Fixed' | 'Range' | 'Negotiable';
  salaryMin: number | null;
  salaryMax: number | null;
  location: string;
  vacancies: number;
  deadline: string;
  howToApply: string;
  contactPerson: string;
  status: 'active' | 'pending' | 'expired' | 'filled' | 'rejected';
  postedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobRef: string;
  employerId: string;
  applicantName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resumeURL: string;
  fileName: string;
  fileSize: number;
  appliedAt: string;
}

export type EffectiveStatus = 'active' | 'pending' | 'expired' | 'filled' | 'rejected';

export interface Filters {
  q: string;
  category: string;
  location: string;
  employmentType: string;
  workSetup: string;
}
