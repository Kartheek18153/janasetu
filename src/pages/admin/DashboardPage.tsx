import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon, XCircleIcon,
  ArrowTrendingUpIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AppService.getDashboardStats();
        setStats(data);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;

  const cards = [
    { label: 'Total Grievances', value: stats?.total || 0, icon: DocumentTextIcon, color: 'bg-admin-500' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: ClockIcon, color: 'bg-admin-orange' },
    { label: 'Resolved', value: stats?.resolved || 0, icon: CheckCircleIcon, color: 'bg-admin-500' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircleIcon, color: 'bg-red-500' },
  ];

  const quickActions = [
    { label: 'View All Grievances', href: '/admin/grievances', color: 'bg-admin-50 text-admin-700' },
    { label: 'Manage Announcements', href: '/admin/announcements', color: 'bg-admin-50 text-admin-700' },
    { label: 'Appointments', href: '/admin/appointments', color: 'bg-admin-peach text-admin-800' },
    { label: 'Manage Officers', href: '/admin/officers', color: 'bg-admin-50 text-admin-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-500 mt-1">Overview of the grievance management system</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{card.value}</p>
            <p className="text-sm text-secondary-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-secondary-900">Performance Metrics</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Avg Resolution Time</span>
              <span className="text-lg font-bold text-secondary-900">{stats?.avgResolutionDays || 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Resolution Rate</span>
              <span className="text-lg font-bold text-admin-500">
                {stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Pending Percentage</span>
              <span className="text-lg font-bold text-admin-orange">
                {stats?.total ? Math.round(((stats.pending + stats.inProgress) / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all"
                style={{ width: `${stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-secondary-900">Quick Actions</h2>
          </div>
          <div className="card-body space-y-2">
            {quickActions.map(action => (
              <Link
                key={action.label}
                to={action.href}
                className={`block p-3 rounded-lg text-sm font-medium ${action.color} hover:opacity-80 transition-opacity`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}