import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon, ClipboardDocumentListIcon, MegaphoneIcon, CalendarDaysIcon,
  ChartBarIcon, UsersIcon, Cog6ToothIcon, BriefcaseIcon, ClockIcon,
  ArrowRightOnRectangleIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';

const primaryNav = [
  { name: 'sidebar.dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'sidebar.grievances', href: '/admin/grievances', icon: ClipboardDocumentListIcon },
  { name: 'sidebar.schedule', href: '/admin/schedule', icon: CalendarDaysIcon },
  { name: 'sidebar.workspace', href: '/admin/workspace', icon: BriefcaseIcon },
];

const secondaryNav = [
  { name: 'sidebar.announcements', href: '/admin/announcements', icon: MegaphoneIcon },
  { name: 'sidebar.appointments', href: '/admin/appointments', icon: ClockIcon },
  { name: 'sidebar.officers', href: '/admin/officers', icon: UsersIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: (v: boolean) => void }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();

  const navLink = (item: typeof primaryNav[0]) => {
    const isActive = location.pathname === item.href ||
      (item.href === '/admin' && location.pathname === '/admin/settings');
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        to={item.href}
        className={'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ' + (isActive
          ? 'bg-gradient-to-r from-admin-50 to-admin-100/80 text-admin-700 shadow-sm'
          : 'text-secondary-600 hover:bg-admin-50/50 hover:text-admin-600')}
        title={collapsed ? t(item.name) : undefined}
      >
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-admin-500 to-admin-600 shadow-sm" />
        )}
        <Icon className={'shrink-0 transition-all duration-200 ' + (collapsed ? 'mx-auto h-6 w-6' : 'mr-3 h-5 w-5') + (isActive
          ? ' text-admin-600'
          : ' text-secondary-400 group-hover:text-admin-500 group-hover:scale-110')} />
        {!collapsed && <span>{t(item.name)}</span>}
        {isActive && !collapsed && (
          <span className="ml-auto text-[10px] font-semibold text-admin-400">●</span>
        )}
      </Link>
    );
  };

  return (
    <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 transition-all duration-300 ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}>
      <div className="flex-1 flex flex-col bg-white/95 backdrop-blur border-r border-admin-200/50 min-h-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-400 truncate">{t('sidebar.dashboard')}</p>
          )}
          <button
            onClick={() => onToggle?.(!collapsed)}
            className="p-1.5 rounded-lg text-admin-400 hover:bg-admin-50 hover:text-admin-600 transition-all"
          >
            {collapsed
              ? <ChevronDoubleRightIcon className="h-4 w-4 mx-auto" />
              : <ChevronDoubleLeftIcon className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {primaryNav.map(navLink)}

          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="flex-1 h-px bg-admin-200/60" />
              <span className="text-admin-300 text-xs">●</span>
              <span className="flex-1 h-px bg-admin-200/60" />
            </div>
          )}

          {collapsed && (
            <div className="flex justify-center py-1">
              <span className="text-admin-300 text-lg leading-none">···</span>
            </div>
          )}

          {secondaryNav.map(navLink)}
        </nav>

        <div className="p-3 border-t border-admin-100 space-y-1">
          <Link
            to="/"
            className="group flex items-center px-3 py-2.5 text-sm font-medium text-secondary-500 rounded-lg hover:bg-admin-50 hover:text-admin-600 transition-all duration-200"
            title={collapsed ? t('common.back') : undefined}
          >
            <HomeIcon className={'shrink-0 transition-all duration-200 ' + (collapsed ? 'mx-auto h-5 w-5' : 'mr-3 h-5 w-5') + ' text-secondary-400 group-hover:text-admin-500 group-hover:scale-110'} />
            {!collapsed && <span>{t('common.back')}</span>}
          </Link>
          <button
            onClick={logout}
            className="group w-full flex items-center px-3 py-2.5 text-sm font-medium text-secondary-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            title={collapsed ? t('sidebar.logout') : undefined}
          >
            <ArrowRightOnRectangleIcon className={'shrink-0 transition-all duration-200 ' + (collapsed ? 'mx-auto h-5 w-5' : 'mr-3 h-5 w-5') + ' text-secondary-400 group-hover:text-red-500 group-hover:scale-110'} />
            {!collapsed && <span>{t('sidebar.logout')}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
