import { Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const citizenNav = [
  { name: 'Home', href: '/' },
  { name: 'File Grievance', href: '/file-grievance' },
  { name: 'Track Grievance', href: '/track' },
  { name: 'Announcements', href: '/announcements' },
  { name: 'Appointments', href: '/appointments' },
];

const adminNav = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Grievances', href: '/admin/grievances' },
  { name: 'Schedule', href: '/admin/schedule' },
  { name: 'Workspace', href: '/admin/workspace' },
];

function NavLink({ name, href, isAdmin }: { name: string; href: string; isAdmin: boolean }) {
  const location = useLocation();
  const active = location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  const base = 'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200';
  const idle = isAdmin
    ? 'text-secondary-600 hover:text-admin-700 hover:bg-admin-50'
    : 'text-secondary-600 hover:text-primary-700 hover:bg-primary-50';
  const activeStyle = isAdmin
    ? 'bg-admin-50 text-admin-700 shadow-sm'
    : 'bg-primary-50 text-primary-700 shadow-sm';

  return (
    <Link to={href} className={`${base} ${active ? activeStyle : idle} relative group`}>
      {name}
      {active && (
        <span className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${
          isAdmin ? 'bg-admin-500' : 'bg-primary-500'
        }`} />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = isAdmin ? adminNav : citizenNav;

  return (
    <Disclosure as="nav" className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-colors duration-300 ${
      isAdmin
        ? 'bg-white/80 border-admin-200/50'
        : 'bg-white/80 border-secondary-200/50'
    }`}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2 group">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                    isAdmin
                      ? 'bg-gradient-to-br from-admin-600 to-admin-700 group-hover:shadow-admin-200/50'
                      : 'bg-gradient-to-br from-primary-600 to-primary-700 group-hover:shadow-primary-200/50'
                  }`}>
                    <span className="text-white font-bold text-sm">JS</span>
                  </div>
                  <span className="text-xl font-bold text-secondary-900 hidden sm:block">JanaSetu</span>
                </Link>
                {!isAuthPage && (
                  <div className="hidden md:flex md:ml-10 md:space-x-1">
                    {navItems.map((item) => (
                      <NavLink key={item.name} name={item.name} href={item.href} isAdmin={isAdmin} />
                    ))}
                    {isAdmin && (
                      <NavLink name="Announcements" href="/announcements" isAdmin={isAdmin} />
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {isAuthenticated ? (
                  <>
                    <Menu as="div" className="relative">
                      <Menu.Button className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                        isAdmin ? 'hover:bg-admin-50' : 'hover:bg-primary-50'
                      }`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          isAdmin
                            ? 'bg-gradient-to-br from-admin-500 to-admin-600'
                            : 'bg-gradient-to-br from-primary-500 to-primary-600'
                        }`}>
                          <span className="text-white text-sm font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-secondary-700">{user?.name}</span>
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
                          <div className={`px-4 py-3 border-b border-secondary-100 ${
                            isAdmin ? 'bg-gradient-to-r from-admin-50 to-white' : 'bg-gradient-to-r from-primary-50 to-white'
                          }`}>
                            <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                            <p className="text-xs text-secondary-500 mt-0.5">{user?.email}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              isAdmin ? 'bg-admin-100 text-admin-700' : 'bg-primary-100 text-primary-700'
                            }`}>
                              {user?.role}
                            </span>
                          </div>
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link to="/account" className={`${active ? 'bg-secondary-50' : ''} block px-4 py-2 text-sm text-secondary-700 transition-colors`}>
                                  Account Settings
                                </Link>
                              )}
                            </Menu.Item>
                            {isAdmin && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link to="/admin" className={`${active ? 'bg-secondary-50' : ''} block px-4 py-2 text-sm text-secondary-700 transition-colors`}>
                                    Admin Dashboard
                                  </Link>
                                )}
                              </Menu.Item>
                            )}

                          </div>
                          <div className="border-t border-secondary-100 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button onClick={handleLogout} className={`${active ? 'bg-red-50' : ''} w-full text-left px-4 py-2 text-sm text-red-600 transition-colors flex items-center gap-2`}>
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>

                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      isAdmin
                        ? 'bg-admin-50 text-admin-700 ring-1 ring-admin-200/50'
                        : 'bg-primary-50 text-primary-700 ring-1 ring-primary-200/50'
                    }`}>
                      {isAdmin ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      )}
                      <span>{isAdmin ? 'Admin' : 'User'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login?role=citizen" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 hover:shadow-sm transition-all duration-200 active:scale-95">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      User
                    </Link>
                    <Link to="/login?role=admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-admin-700 bg-admin-50 hover:bg-admin-100 hover:shadow-sm transition-all duration-200 active:scale-95">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Admin
                    </Link>
                  </div>
                )}

                <Disclosure.Button className={`md:hidden p-2 rounded-lg transition-all duration-200 ${
                  isAdmin
                    ? 'text-secondary-400 hover:text-admin-600 hover:bg-admin-50'
                    : 'text-secondary-400 hover:text-primary-600 hover:bg-primary-50'
                }`}>
                  {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden border-t border-secondary-200">
            <div className="px-4 py-3 space-y-1">
              {!isAuthPage && navItems.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? (isAdmin ? 'bg-admin-50 text-admin-700' : 'bg-primary-50 text-primary-700')
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {!isAuthPage && isAdmin && (
                <Disclosure.Button
                  as={Link}
                  to="/announcements"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/announcements'
                      ? 'bg-admin-50 text-admin-700'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  Announcements
                </Disclosure.Button>
              )}
              {!isAuthPage && (
                <Disclosure.Button
                  as={Link}
                  to="/account"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
                >
                  Account Settings
                </Disclosure.Button>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}