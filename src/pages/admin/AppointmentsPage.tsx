import { useState, useEffect } from 'react';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { Appointment, AppointmentStatus } from '../../types';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);

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

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : appointments.length === 0 ? (
        <EmptyState icon={<CalendarDaysIcon className="h-12 w-12" />} title="No appointments" />
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-secondary-900">{a.purpose}</h3>
                    <p className="text-sm text-secondary-500 mt-1">
                      {a.citizenName} → {a.officerName} ({a.officerDesignation})
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
              <div>
                <p className="text-secondary-500">Citizen</p>
                <p className="font-medium">{selected.citizenName}</p>
                <p className="text-xs text-secondary-400">{selected.citizenPhone}</p>
                <p className="text-xs text-secondary-400">{selected.citizenEmail}</p>
              </div>
              <div>
                <p className="text-secondary-500">Officer</p>
                <p className="font-medium">{selected.officerName}</p>
                <p className="text-xs text-secondary-400">{selected.officerDesignation}</p>
              </div>
              <div>
                <p className="text-secondary-500">Date & Time</p>
                <p className="font-medium">{new Date(selected.preferredDate).toLocaleDateString('en-IN')}</p>
                <p className="text-xs text-secondary-400">{selected.preferredTimeSlot}</p>
              </div>
              <div>
                <p className="text-secondary-500">Department</p>
                <p className="font-medium">{selected.department}</p>
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

            <div className="flex gap-2 pt-4 border-t">
              {selected.status === 'requested' && (
                <>
                  <button onClick={() => handleUpdateStatus(selected.id, 'confirmed')} className="btn-primary">Confirm</button>
                  <button onClick={() => handleUpdateStatus(selected.id, 'cancelled')} className="btn-danger">Cancel</button>
                </>
              )}
              {selected.status === 'confirmed' && (
                <button onClick={() => handleUpdateStatus(selected.id, 'completed')} className="btn-primary">Mark Completed</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}