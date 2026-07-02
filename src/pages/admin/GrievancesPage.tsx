import { useState, useEffect } from 'react';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusTimeline from '../../components/ui/StatusTimeline';
import Modal from '../../components/ui/Modal';
import { Grievance, GrievanceStatus } from '../../types';
import { DocumentTextIcon, FunnelIcon } from '@heroicons/react/24/outline';

const statusFilters: { label: string; value: GrievanceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GrievanceStatus | 'all'>('all');
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<GrievanceStatus>('under_review');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AppService.getGrievances();
        setGrievances(data);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
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
    setGrievances(updated as any);
    setSelected(updated.find(g => g.id === selected.id) as any);
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
          <h1 className="text-2xl font-bold text-secondary-900">Grievances</h1>
          <p className="text-secondary-500 mt-1">Manage and track all citizen grievances</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              filter === f.value ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.value ? 'bg-white/20' : 'bg-secondary-100 text-secondary-500'
              }`}>
                {counts[f.value] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<DocumentTextIcon className="h-12 w-12" />} title="No grievances found" description="No grievances match the current filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map(g => (
            <div
              key={g.id}
              onClick={() => setSelected(g)}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
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
              <div>
                <p className="text-secondary-500">Citizen</p>
                <p className="font-medium">{selected.citizenName}</p>
                <p className="text-xs text-secondary-400">{selected.citizenPhone}</p>
              </div>
              <div>
                <p className="text-secondary-500">Department</p>
                <p className="font-medium">{selected.department}</p>
              </div>
              <div>
                <p className="text-secondary-500">Priority</p>
                <Badge status={selected.priority} />
              </div>
              <div>
                <p className="text-secondary-500">Assigned To</p>
                <p className="font-medium">{selected.assignedToName || 'Not assigned'}</p>
              </div>
            </div>

            <StatusTimeline events={selected.timeline} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => { setSelected(selected); setStatusModal(true); }} className="btn-primary">
                Update Status
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Status" size="md">
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
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="input resize-y"
              rows={3}
              placeholder="Describe the action taken..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setStatusModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleUpdateStatus} disabled={!statusNote.trim()} className="btn-primary">Update</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}