import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon, ClipboardDocumentListIcon, MegaphoneIcon, CalendarDaysIcon,
  ChartBarIcon, UsersIcon, Cog6ToothIcon, BriefcaseIcon, ClockIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const sidebarNav = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Grievances', href: '/admin/grievances', icon: ClipboardDocumentListIcon },
  { name: 'Schedule', href: '/admin/schedule', icon: CalendarDaysIcon },
  { name: 'Workspace', href: '/admin/workspace', icon: BriefcaseIcon },
  { name: 'Announcements', href: '/admin/announcements', icon: MegaphoneIcon },
  { name: 'Appointments', href: '/admin/appointments', icon: ClockIcon },
  { name: 'Officers', href: '/admin/officers', icon: UsersIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex-1 flex flex-col bg-white/95 backdrop-blur border-r border-admin-200/50 min-h-0">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-400">Main Navigation</p>
          </div>
          <nav className="flex-1 px-3 space-y-0.5">
            {sidebarNav.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href === '/admin' && location.pathname === '/admin/settings');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-admin-50 text-admin-700'
                      : 'text-secondary-600 hover:bg-admin-50/50 hover:text-admin-600'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-admin-500" />
                  )}
                  <item.icon className={`mr-3 h-5 w-5 shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'text-admin-600'
                      : 'text-secondary-400 group-hover:text-admin-500 group-hover:scale-110'
                  }`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto text-[10px] font-semibold text-admin-400">●</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-admin-100 space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-admin-400">Session</p>
          <Link
            to="/"
            className="group flex items-center px-3 py-2.5 text-sm font-medium text-secondary-500 rounded-lg hover:bg-admin-50 hover:text-admin-600 transition-all duration-200"
          >
            <HomeIcon className="mr-3 h-5 w-5 text-secondary-400 group-hover:text-admin-500 group-hover:scale-110 transition-all duration-200" />
            Back to Site
          </Link>
          <button
            onClick={logout}
            className="group w-full flex items-center px-3 py-2.5 text-sm font-medium text-secondary-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-secondary-400 group-hover:text-red-500 group-hover:scale-110 transition-all duration-200" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}