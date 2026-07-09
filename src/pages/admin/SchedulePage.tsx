import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { AppointmentService } from '../../services';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Appointment, AppointmentStatus } from '../../types';

const statusTabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Requested', value: 'requested' as const },
  { label: 'Confirmed', value: 'confirmed' as const },
  { label: 'Completed', value: 'completed' as const },
];

export default function AdminSchedulePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');

  const today = new Date().toDateString();

  useEffect(() => {
    const load = async () => {
      try {
        const all = await AppointmentService.getAllAppointments();
        const todayApps = all.filter(a => new Date(a.preferredDate).toDateString() === today);
        if (user?.department) {
          setAppointments(todayApps.filter(a => a.department === user.department));
        } else {
          setAppointments(todayApps);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const updateStatus = async (id: string, status: string) => {
    try {
      await AppointmentService.updateStatus(id, status as AppointmentStatus);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } as Appointment : a));
    } catch {}
  };

  return (
    <div className="auto-reveal-children">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{t('admin.schedule.title')}</h1>
          <p className="text-secondary-500 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-1 bg-secondary-100/80 rounded-lg p-1">
          {statusTabs.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={'px-3 py-1.5 text-xs font-medium rounded-md transition-all ' + (filter === tab.value ? 'bg-white text-admin-700 shadow-sm' : 'text-secondary-500 hover:text-secondary-700')}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner size="lg" className="py-12" /> : filtered.length === 0 ? (
        <EmptyState icon={<CalendarDaysIcon className="h-12 w-12" />} title="No appointments today" description="You have no scheduled appointments for today." />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-secondary-500">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''} today</p>
          {filtered.map(app => (
            <div key={app.id} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-admin-500 to-admin-600 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white font-bold text-sm">{app.citizenName?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{app.citizenName}</h3>
                      <p className="text-sm text-secondary-500">{app.purpose}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary-400">
                        <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{app.preferredTimeSlot}</span>
                        <span>{app.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status={app.status} size="sm" />
                    {app.status === 'requested' && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(app.id, 'confirmed')} className="px-2.5 py-1 text-xs font-medium bg-admin-50 text-admin-700 rounded-md hover:bg-admin-100 hover:text-admin-800 transition-all">Confirm</button>
                        <button onClick={() => updateStatus(app.id, 'cancelled')} className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-all">Cancel</button>
                      </div>
                    )}
                    {app.status === 'confirmed' && (
                      <button onClick={() => updateStatus(app.id, 'completed')} className="px-2.5 py-1 text-xs font-medium bg-admin-50 text-admin-700 rounded-md hover:bg-admin-100 transition-all">Complete</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
