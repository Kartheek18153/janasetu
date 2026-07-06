import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  ClipboardDocumentListIcon, ClockIcon, CalendarDaysIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Grievance, Appointment } from '../../types';

export default function AdminWorkspacePage() {
  const { t } = useTranslation();
  const [pendingGrievances, setPendingGrievances] = useState<Grievance[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toDateString();

  useEffect(() => {
    const load = async () => {
      try {
        const [grievances, appointments] = await Promise.all([
          AppService.getGrievances(),
          AppService.getAllAppointments(),
        ]);
        setPendingGrievances(grievances.filter(g => g.status === 'submitted' || g.status === 'under_review').slice(0, 5));
        setTodayAppointments(appointments.filter(a => new Date(a.preferredDate).toDateString() === today && a.status !== 'cancelled'));
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">{t('admin.workspace.title')}</h1>
        <p className="text-secondary-500 mt-1">Your daily tasks and pending items overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card hover:shadow-xl transition-all duration-300">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-4 w-4 text-yellow-600" />
              </div>
              <h2 className="font-semibold text-secondary-900">Pending Grievances</h2>
            </div>
            <Link to="/admin/grievances" className="text-xs text-admin-600 hover:text-admin-700 font-medium transition-colors">View all</Link>
          </div>
          <div className="card-body">
            {pendingGrievances.length === 0 ? (
              <div className="text-center py-8 text-secondary-400 text-sm">
                <ClipboardDocumentListIcon className="h-10 w-10 mx-auto mb-2" />
                No pending grievances
              </div>
            ) : (
              <div className="space-y-2">
                {pendingGrievances.map(g => (
                  <Link key={g.id} to="/admin/grievances" className="flex items-start justify-between p-3 rounded-lg bg-secondary-50 hover:bg-admin-50 transition-all duration-200">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                        <p className="text-sm font-medium text-secondary-900 truncate">{g.title}</p>
                      </div>
                      <p className="text-xs text-secondary-500 mt-0.5 ml-3.5">{g.department} - {g.trackingId}</p>
                    </div>
                    <Badge status={g.priority} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card hover:shadow-xl transition-all duration-300">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-secondary-900">Today's Appointments</h2>
            </div>
            <Link to="/admin/schedule" className="text-xs text-admin-600 hover:text-admin-700 font-medium transition-colors">View all</Link>
          </div>
          <div className="card-body">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-secondary-400 text-sm">
                <CalendarDaysIcon className="h-10 w-10 mx-auto mb-2" />
                No appointments today
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 hover:bg-admin-50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-admin-500 to-admin-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-xs">{a.citizenName?.charAt(0) || '?'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-900">{a.citizenName}</p>
                        <p className="text-xs text-secondary-500">{a.purpose} - {a.preferredTimeSlot}</p>
                      </div>
                    </div>
                    <Badge status={a.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-admin-600 to-admin-700 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/admin/grievances" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium group">
            <ClipboardDocumentListIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Review Grievances
          </Link>
          <Link to="/admin/schedule" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium group">
            <CalendarDaysIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            View Schedule
          </Link>
          <Link to="/admin/appointments" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium group">
            <ClockIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Manage Appointments
          </Link>
          <Link to="/admin/announcements" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium group">
            <ExclamationTriangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            New Announcement
          </Link>
        </div>
      </div>
    </div>
  );
}
