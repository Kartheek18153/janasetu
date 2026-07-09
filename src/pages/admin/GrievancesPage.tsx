import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { grievanceFromDoc } from '../../services/grievanceService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusTimeline from '../../components/ui/StatusTimeline';
import Modal from '../../components/ui/Modal';
import { Grievance, GrievanceStatus } from '../../types';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const statusFilters: { label: string; value: GrievanceStatus | 'all'; color: string }[] = [
  { label: 'All', value: 'all', color: 'bg-admin-500' },
  { label: 'Submitted', value: 'submitted', color: 'bg-admin-500' },
  { label: 'Under Review', value: 'under_review', color: 'bg-admin-orange' },
  { label: 'Assigned', value: 'assigned', color: 'bg-blue-500' },
  { label: 'In Progress', value: 'in_progress', color: 'bg-yellow-500' },
  { label: 'Resolved', value: 'resolved', color: 'bg-green-500' },
  { label: 'Rejected', value: 'rejected', color: 'bg-red-500' },
];

export default function AdminGrievancesPage() {
  const { t } = useTranslation();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<GrievanceStatus | 'all'>(() => {
    const s = searchParams.get('status');
    const valid = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'];
    return s && valid.includes(s) ? (s as GrievanceStatus) : 'all';
  });
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<GrievanceStatus>('under_review');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'grievances'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => grievanceFromDoc(d.id, d.data()));
      setGrievances(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const filtered = filter === 'all' ? grievances : grievances.filter(g => g.status === filter);

  const handleUpdateStatus = async () => {
    if (!selected || !statusNote.trim()) return;
    const updated = grievances.map(g => {
      if (g.id === selected.id) {
        const event = {
          id: crypto.randomUUID(),
          status: newStatus,
          description: statusNote,
          updatedBy: 'admin-1',
          updatedByName: 'Admin Officer',
          createdAt: new Date(),
          isVisibleToCitizen: true,
        };
        return { ...g, status: newStatus, timeline: [...g.timeline, event], updatedAt: new Date() };
      }
      return g;
    });
    setGrievances(updated);
    setSelected(updated.find(g => g.id === selected.id)!);
    setStatusModal(false);
    setStatusNote('');
  };

  const counts: Record<string, number> = {
    all: grievances.length,
    submitted: grievances.filter(g => g.status === 'submitted').length,
    under_review: grievances.filter(g => g.status === 'under_review').length,
    assigned: grievances.filter(g => g.status === 'assigned' || g.status === 'in_progress').length,
    resolved: grievances.filter(g => g.status === 'resolved' || g.status === 'closed').length,
    rejected: grievances.filter(g => g.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('admin.grievances.title')}</h1>
          <p className="text-secondary-500 mt-1">Manage and track all citizen grievances</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map(f => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ' + (isActive ? 'text-white shadow-md scale-[1.02]' : 'bg-white text-secondary-600 hover:bg-admin-50 hover:text-admin-700 border border-secondary-200 hover:border-admin-200')}
            >
              {isActive && <span className={'absolute inset-0 rounded-lg ' + (f.value === 'all' ? 'bg-admin-500' : f.color + ' opacity-80')} />}
              <span className="relative z-10 flex items-center gap-2">
                {f.label}
                {f.value !== 'all' && (
                  <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (isActive ? 'bg-white/20' : 'bg-secondary-100 text-secondary-500')}>
                    {counts[f.value] || 0}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<DocumentTextIcon className="h-12 w-12" />} title="No grievances found" description="No grievances match the current filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map(g => (
            <div key={g.id} onClick={() => setSelected(g)} className="card cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-admin-400 shrink-0" />
                      <h3 className="font-semibold text-secondary-900 truncate">{g.title}</h3>
                      <Badge status={g.priority} size="sm" />
                    </div>
                    <p className="text-sm text-secondary-600 line-clamp-2">{g.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-secondary-400">
                      <span>by {g.citizenName}</span>
                      <span>{g.department}</span>
                      <span>{new Date(g.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <Badge status={g.status} size="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected && !statusModal} onClose={() => setSelected(null)} title="Grievance Details" size="lg">
        {selected && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-secondary-900">{selected.title}</h3>
                <Badge status={selected.status} size="md" />
              </div>
              <p className="text-xs text-secondary-500 font-mono mb-3">ID: {selected.trackingId}</p>
              <p className="text-sm text-secondary-700">{selected.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Citizen</p>
                <p className="font-medium text-secondary-900">{selected.citizenName}</p>
                <p className="text-xs text-secondary-400">{selected.citizenPhone}</p>
              </div>
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Department</p>
                <p className="font-medium text-secondary-900">{selected.department}</p>
              </div>
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Priority</p>
                <Badge status={selected.priority} />
              </div>
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Assigned To</p>
                <p className="font-medium text-secondary-900">{selected.assignedToName || 'Not assigned'}</p>
              </div>
            </div>

            <StatusTimeline events={selected.timeline} />

            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
              <button onClick={() => { setSelected(selected); setStatusModal(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-600 to-admin-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-admin-200/50 transition-all active:scale-[0.97]">
                {t('admin.grievances.updateStatus')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title={t('admin.grievances.updateStatus')} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">New Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as GrievanceStatus)} className="input">
              {statusFilters.filter(f => f.value !== 'all').map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Note/Description</label>
            <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="input resize-y" rows={3} placeholder="Describe the action taken..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <button onClick={() => setStatusModal(false)} className="px-5 py-2.5 rounded-xl bg-secondary-100 text-secondary-700 text-sm font-semibold hover:bg-secondary-200 transition-all">Cancel</button>
            <button onClick={handleUpdateStatus} disabled={!statusNote.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-600 to-admin-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-admin-200/50 transition-all active:scale-[0.97] disabled:opacity-50">Update</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
