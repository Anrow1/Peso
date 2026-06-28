'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Admin } from '@/lib/types';
import StatusPill from '@/components/StatusPill';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/lib/useAuth';

export default function AdminManagementPage() {
  const { showToast } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'reject' | 'suspend' } | null>(null);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'admins'), orderBy('createdAt', 'desc')), snap => {
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() } as Admin)));
      setLoading(false);
    });
  }, []);

  async function approve(id: string) {
    await updateDoc(doc(db, 'admins', id), { status: 'active' });
    showToast('Admin approved! They can now log in.');
  }
  async function reject(id: string) {
    await updateDoc(doc(db, 'admins', id), { status: 'rejected' });
    showToast('Admin registration declined.');
  }

  const pending = admins.filter(a => a.status === 'pending');
  const others = admins.filter(a => a.status !== 'pending');
  const target = admins.find(a => a.id === confirmAction?.id);

  return (
    <>
      {confirmAction && target && (
        <ConfirmModal
          title={confirmAction.type === 'reject' ? 'Decline Registration?' : 'Suspend Admin?'}
          message={`Decline registration for "${target.email}"? They will not be able to log in.`}
          confirmLabel="Decline"
          confirmClass="btn-danger"
          onConfirm={() => reject(confirmAction.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}

      <div className="section-title">Manage Admins</div>

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner spinner-blue" style={{ width: 28, height: 28 }} /></div>
        : <>
          {pending.length > 0 && (
            <>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10 }}>Pending Registration ({pending.length})</h3>
              {pending.map(a => (
                <div key={a.id} className="panel" style={{ marginBottom: 12, borderColor: '#EBD2A2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{a.email}</strong>
                      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                        {a.displayName || 'PESO Administrator'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-green btn-sm" onClick={() => approve(a.id)}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmAction({ id: a.id, type: 'reject' })}>Decline</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--ink-soft)', margin: '20px 0 10px' }}>All Admins</h3>
          <div className="panel">
            <table>
              <thead>
                <tr><th>Email</th><th>Name</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {others.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.email}</strong></td>
                    <td>{a.displayName || 'PESO Administrator'}</td>
                    <td><StatusPill status={a.status === 'active' ? 'active' : a.status === 'pending' ? 'pending' : 'expired'} /></td>
                    <td>
                      {a.status === 'active'
                        ? <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Active</span>
                        : a.status === 'rejected'
                          ? <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Declined</span>
                          : null
                      }
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
