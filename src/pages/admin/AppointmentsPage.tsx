import { useState, useEffect } from 'react';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { Appointment, AppointmentStatus } from '../../types';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const statusTabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Requested', value: 'requested' as const },
  { label: 'Confirmed', value: 'confirmed' as const },
  { label: 'Completed', value: 'completed' as const },
  { label: 'Cancelled', value: 'cancelled' as const },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AppService.getAllAppointments();
        setAppointments(data);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, updatedAt: new Date() } : a));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Appointments</h1>
        <p className="text-secondary-500 mt-1">Manage citizen appointment requests</p>
      </div>

      <div className="flex gap-1 p-1 bg-secondary-100/80 rounded-lg w-fit">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={'px-3 py-1.5 text-xs font-medium rounded-md transition-all ' + (filter === tab.value ? 'bg-white shadow-sm text-admin-700' : 'text-secondary-500 hover:text-secondary-700')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CalendarDaysIcon className="h-12 w-12" />} title="No appointments" description="No appointments match the current filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} onClick={() => setSelected(a)} className="card cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-admin-400 shrink-0" />
                      <h3 className="font-semibold text-secondary-900">{a.purpose}</h3>
                    </div>
                    <p className="text-sm text-secondary-500">
                      {a.citizenName} {'\u2192'} {a.officerName} ({a.officerDesignation})
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-secondary-400">
                      <span>{new Date(a.preferredDate).toLocaleDateString('en-IN')} {a.preferredTimeSlot}</span>
                      <span>{a.department}</span>
                      <span>{a.citizenPhone}</span>
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Appointment Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Citizen</p>
                <p className="font-medium text-secondary-900">{selected.citizenName}</p>
                <p className="text-xs text-secondary-400">{selected.citizenPhone}</p>
                <p className="text-xs text-secondary-400">{selected.citizenEmail}</p>
              </div>
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Officer</p>
                <p className="font-medium text-secondary-900">{selected.officerName}</p>
                <p className="text-xs text-secondary-400">{selected.officerDesignation}</p>
              </div>
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Date & Time</p>
                <p className="font-medium text-secondary-900">{new Date(selected.preferredDate).toLocaleDateString('en-IN')}</p>
                <p className="text-xs text-secondary-400">{selected.preferredTimeSlot}</p>
              </div>
              <div className="p-3 rounded-lg bg-admin-50/50">
                <p className="text-secondary-500 text-xs">Department</p>
                <p className="font-medium text-secondary-900">{selected.department}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-secondary-500">Purpose</p>
              <p className="text-sm text-secondary-700">{selected.purpose}</p>
            </div>
            {selected.notes && (
              <div>
                <p className="text-sm text-secondary-500">Notes</p>
                <p className="text-sm text-secondary-700">{selected.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-secondary-200">
              {selected.status === 'requested' && (
                <>
                  <button onClick={() => handleUpdateStatus(selected.id, 'confirmed')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-600 to-admin-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-admin-200/50 transition-all active:scale-[0.97]">Confirm</button>
                  <button onClick={() => handleUpdateStatus(selected.id, 'cancelled')} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all">Cancel</button>
                </>
              )}
              {selected.status === 'confirmed' && (
                <button onClick={() => handleUpdateStatus(selected.id, 'completed')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-600 to-admin-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-admin-200/50 transition-all active:scale-[0.97]">Mark Completed</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
