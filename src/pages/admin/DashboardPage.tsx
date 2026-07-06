import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon, XCircleIcon,
  ArrowTrendingUpIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total: number; pending: number; inProgress: number; resolved: number;
  rejected: number; avgResolutionDays: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'grievances'), (snap) => {
      const all = snap.docs.map(d => d.data() as any);
      const total = all.length;
      const pendingCount = all.filter((g: any) => g.status === 'submitted' || g.status === 'under_review').length;
      const inProgressCount = all.filter((g: any) => g.status === 'assigned' || g.status === 'in_progress').length;
      const resolvedCount = all.filter((g: any) => g.status === 'resolved' || g.status === 'closed').length;
      const rejectedCount = all.filter((g: any) => g.status === 'rejected').length;
      setStats({
        total,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
        avgResolutionDays: 3.5,
      });
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;

  const cards = [
    { label: t('admin.dashboard.totalGrievances'), value: stats?.total || 0, icon: DocumentTextIcon, color: 'bg-admin-500', filter: 'all', hoverColor: 'group-hover:shadow-admin-200/50' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: ClockIcon, color: 'bg-admin-orange', filter: 'in_progress', hoverColor: 'group-hover:shadow-orange-200/50' },
    { label: t('admin.dashboard.resolvedGrievances'), value: stats?.resolved || 0, icon: CheckCircleIcon, color: 'bg-admin-500', filter: 'resolved', hoverColor: 'group-hover:shadow-admin-200/50' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircleIcon, color: 'bg-red-500', filter: 'rejected', hoverColor: 'group-hover:shadow-red-200/50' },
  ];

  const quickActions = [
    { label: 'View All Grievances', href: '/admin/grievances', icon: DocumentTextIcon, color: 'from-admin-500 to-admin-600' },
    { label: 'Manage Announcements', href: '/admin/announcements', icon: ClockIcon, color: 'from-admin-orange to-admin-orange' },
    { label: 'Appointments', href: '/admin/appointments', icon: UserGroupIcon, color: 'from-admin-600 to-admin-700' },
    { label: 'Manage Officers', href: '/admin/officers', icon: UserGroupIcon, color: 'from-admin-500 to-admin-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">{t('admin.dashboard.title')}</h1>
        <p className="text-secondary-500 mt-1">Overview of the grievance management system</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link
            key={card.label}
            to={'/admin/grievances' + (card.filter !== 'all' ? '?status=' + card.filter : '')}
            className={'card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group cursor-pointer ' + card.hoverColor}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={'w-10 h-10 rounded-lg ' + card.color + ' flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300'}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{card.value}</p>
            <p className="text-sm text-secondary-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card transition-all duration-300 hover:shadow-xl">
          <div className="card-header">
            <h2 className="font-semibold text-secondary-900">Performance Metrics</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-admin-50/50">
              <span className="text-sm text-secondary-600">Avg Resolution Time</span>
              <span className="text-lg font-bold text-secondary-900">{stats?.avgResolutionDays || 0} days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-admin-50/50">
              <span className="text-sm text-secondary-600">Resolution Rate</span>
              <span className="text-lg font-bold text-admin-500">
                {stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-admin-50/50">
              <span className="text-sm text-secondary-600">Pending Percentage</span>
              <span className="text-lg font-bold text-admin-orange">
                {stats?.total ? Math.round(((stats.pending + stats.inProgress) / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-admin-500 to-admin-600 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: (stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0) + '%' }}
              />
            </div>
          </div>
        </div>

        <div className="card transition-all duration-300 hover:shadow-xl">
          <div className="card-header">
            <h2 className="font-semibold text-secondary-900">{t('admin.dashboard.quickActions')}</h2>
          </div>
          <div className="card-body space-y-2">
            {quickActions.map(action => (
              <Link
                key={action.label}
                to={action.href}
                className={'group flex items-center gap-3 p-3 rounded-lg text-sm font-medium bg-admin-50 text-admin-700 hover:bg-gradient-to-r ' + action.color + ' hover:text-white transition-all duration-300'}
              >
                <action.icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>{action.label}</span>
                <svg className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
