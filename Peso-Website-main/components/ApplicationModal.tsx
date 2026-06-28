'use client';

import { useState, useRef } from 'react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { Job } from '@/lib/types';
import { fmtFileSize } from '@/lib/data';

interface Props {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({ job, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', coverLetter: '' });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|doc|docx)$/i)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5 MB.');
      return;
    }
    setError('');
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Please fill in your name and email.'); return; }
    if (!file) { setError('Please attach your resume or CV.'); return; }
    setError('');
    setUploading(true);

    try {
      // 1. Upload resume to Firebase Storage
      const timestamp = Date.now();
      const path = `resumes/${job.id}/${timestamp}_${file.name}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, file);

      const resumeURL = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => { resolve(await getDownloadURL(uploadTask.snapshot.ref)); }
        );
      });

      // 2. Save application to Firestore
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        jobTitle: job.title,
        jobRef: job.ref,
        employerId: job.employerId,
        applicantName: form.name,
        email: form.email,
        phone: form.phone,
        coverLetter: form.coverLetter,
        resumeURL,
        fileName: file.name,
        fileSize: file.size,
        appliedAt: serverTimestamp(),
      });

      setUploading(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      setUploading(false);
      setError('Submission failed. Please check your connection and try again.');
    }
  }

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget && !uploading) onClose(); }}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ marginBottom: 2 }}>Apply for this Position</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>{job.title} &nbsp;·&nbsp; <span className="mono">{job.ref}</span></p>
          </div>
          {!uploading && <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--ink-soft)', cursor: 'pointer', lineHeight: 1 }}>×</button>}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field">
                <label>Full Name <span className="req">*</span></label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xxxxxxxxx" />
              </div>
            </div>
            <div className="field">
              <label>Email Address <span className="req">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
            </div>
            <div className="field">
              <label>Cover Letter / Message</label>
              <textarea value={form.coverLetter} onChange={e => setForm({ ...form, coverLetter: e.target.value })} placeholder="Tell the employer why you're a great fit..." style={{ minHeight: 80 }} />
            </div>

            {/* Resume Upload */}
            <div className="field">
              <label>Resume / CV <span className="req">*</span></label>
              <div
                className={`file-upload-area ${file ? 'has-file' : ''}`}
                onClick={() => !uploading && fileRef.current?.click()}
              >
                {file ? (
                  <div className="file-chip">
                    <span>📄</span>
                    <span className="chip-name">{file.name}</span>
                    <span style={{ opacity: .7, fontSize: 12 }}>({fmtFileSize(file.size)})</span>
                    {!uploading && (
                      <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, color: 'var(--red)', fontWeight: 700 }}>×</button>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Click to attach resume</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 3 }}>PDF, DOC, or DOCX — max 5 MB</div>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{ display: 'none' }} />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--ink-soft)' }}>
                  <span>Uploading resume...</span><span>{progress}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--paper-deep)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--blue)', transition: 'width .2s' }} />
                </div>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? <><span className="spinner" style={{ marginRight: 6 }} />Submitting...</> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
