import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  ClipboardDocumentListIcon, ClockIcon, CalendarDaysIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Grievance, Appointment } from '../../types';

export default function AdminWorkspacePage() {
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
        <h1 className="text-2xl font-bold text-secondary-900">Workspace</h1>
        <p className="text-secondary-500 mt-1">Your daily tasks and pending items overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Grievances */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="h-5 w-5 text-yellow-500" />
              <h2 className="font-semibold text-secondary-900">Pending Grievances</h2>
            </div>
            <Link to="/admin/grievances" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="card-body">
            {pendingGrievances.length === 0 ? (
              <div className="text-center py-8 text-secondary-400 text-sm">
                <ClipboardDocumentListIcon className="h-10 w-10 mx-auto mb-2" />
                No pending grievances
              </div>
            ) : (
              <div className="space-y-3">
                {pendingGrievances.map(g => (
                  <div key={g.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-secondary-900 truncate">{g.title}</p>
                      <p className="text-xs text-secondary-500 mt-0.5">{g.department} - {g.trackingId}</p>
                    </div>
                    <Badge status={g.priority} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-secondary-900">Today's Appointments</h2>
            </div>
            <Link to="/admin/schedule" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="card-body">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-secondary-400 text-sm">
                <CalendarDaysIcon className="h-10 w-10 mx-auto mb-2" />
                No appointments today
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{a.citizenName}</p>
                      <p className="text-xs text-secondary-500">{a.purpose} - {a.preferredTimeSlot}</p>
                    </div>
                    <Badge status={a.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/admin/grievances" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
            <ClipboardDocumentListIcon className="h-5 w-5" />
            Review Grievances
          </Link>
          <Link to="/admin/schedule" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
            <CalendarDaysIcon className="h-5 w-5" />
            View Schedule
          </Link>
          <Link to="/admin/appointments" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
            <ClockIcon className="h-5 w-5" />
            Manage Appointments
          </Link>
          <Link to="/admin/announcements" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
            <ExclamationTriangleIcon className="h-5 w-5" />
            New Announcement
          </Link>
        </div>
      </div>
    </div>
  );
}