'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employer } from '@/lib/types';
import StatusPill from '@/components/StatusPill';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/lib/useAuth';

export default function AdminEmployersPage() {
  const { showToast } = useAuth();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'reject' | 'suspend' } | null>(null);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'employers'), orderBy('createdAt', 'desc')), snap => {
      setEmployers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Employer)));
      setLoading(false);
    });
  }, []);

  async function approve(id: string) {
    await updateDoc(doc(db, 'employers', id), { status: 'active' });
    showToast('Employer approved! They can now log in.');
  }
  async function reject(id: string) {
    await updateDoc(doc(db, 'employers', id), { status: 'rejected' });
    showToast('Employer registration declined.');
  }
  async function suspend(id: string) {
    await updateDoc(doc(db, 'employers', id), { status: 'suspended' });
    showToast('Employer account suspended.');
  }

  const pending = employers.filter(e => e.status === 'pending');
  const others = employers.filter(e => e.status !== 'pending');
  const target = employers.find(e => e.id === confirmAction?.id);

  return (
    <>
      {confirmAction && target && (
        <ConfirmModal
          title={confirmAction.type === 'reject' ? 'Decline Registration?' : 'Suspend Employer?'}
          message={confirmAction.type === 'reject'
            ? `Decline registration for "${target.name}"? They will not be able to log in.`
            : `Suspend "${target.name}"? Their active listings will be hidden.`}
          confirmLabel={confirmAction.type === 'reject' ? 'Decline' : 'Suspend'}
          confirmClass="btn-danger"
          onConfirm={() => confirmAction.type === 'reject' ? reject(confirmAction.id) : suspend(confirmAction.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}

      <div className="section-title">Manage Employers</div>

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>
        : <>
          {pending.length > 0 && (
            <>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10 }}>Pending Registration ({pending.length})</h3>
              {pending.map(e => (
                <div key={e.id} className="panel" style={{ marginBottom: 12, borderColor: '#EBD2A2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{e.name}</strong>
                      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                        {e.industry} · {e.address}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                        {e.contact} · {e.email} {e.phone ? `· ${e.phone}` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                        Permit: <span className="mono">{e.permit}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-green btn-sm" onClick={() => approve(e.id)}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmAction({ id: e.id, type: 'reject' })}>Decline</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--ink-soft)', margin: '20px 0 10px' }}>All Employers</h3>
          <div className="panel">
            <table>
              <thead>
                <tr><th>Company</th><th>Industry</th><th>Contact</th><th>Permit No.</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {others.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{e.address}</div></td>
                    <td>{e.industry}</td>
                    <td>{e.contact}<div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{e.email}</div></td>
                    <td className="mono">{e.permit}</td>
                    <td><StatusPill status={e.status === 'active' ? 'active' : e.status === 'pending' ? 'pending' : 'expired'} /></td>
                    <td>
                      {e.status === 'active'
                        ? <button className="btn btn-ghost btn-sm" onClick={() => setConfirmAction({ id: e.id, type: 'suspend' })}>Suspend</button>
                        : e.status === 'suspended'
                          ? <button className="btn btn-green btn-sm" onClick={() => approve(e.id)}>Reinstate</button>
                          : <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Declined</span>
                      }
                      <a href={`/admin/employers/${e.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 8, color: 'var(--blue)' }}>
                        View Details →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
    </>
  );
}
