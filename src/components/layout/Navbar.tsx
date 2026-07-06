import { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import type { SupportedLanguage } from '../../types';
import AppService from '../../services/appService';

const languages: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

function NavLink({ name, href, isAdmin }: { name: string; href: string; isAdmin: boolean }) {
  const location = useLocation();
  const active = location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

  return (
    <Link
      to={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
        active
          ? isAdmin ? 'text-admin-700 bg-admin-50' : 'text-blue-700 bg-blue-50'
          : isAdmin
            ? 'text-secondary-600 hover:text-admin-700 hover:bg-admin-50'
            : 'text-secondary-600 hover:text-blue-700 hover:bg-blue-50'
      }`}
    >
      {name}
      {active && (
        <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${isAdmin ? 'bg-admin-500' : 'bg-[#FF9933]'}`} />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentLang = (user?.language || 'en') as SupportedLanguage;
  const activeLang = languages.find(l => l.code === currentLang) || languages[0];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const switchLanguage = async (code: SupportedLanguage) => {
    if (user) {
      await AppService.updateUserProfile(user.uid, { language: code } as any);
      await refreshProfile();
    }
    setLangOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = isAdmin
    ? [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Grievances', href: '/admin/grievances' },
        { name: 'Schedule', href: '/admin/schedule' },
        { name: 'Workspace', href: '/admin/workspace' },
      ]
    : [
        { name: 'Home', href: '/' },
        { name: 'Schemes', href: '/schemes' },
        { name: 'Grievance', href: '/file-grievance' },
        { name: 'Track', href: '/track' },
        { name: 'Documents', href: '/documents' },
        { name: 'Appointments', href: '/appointments' },
      ];

  return (
    <Disclosure as="nav" className={`sticky top-0 z-40 bg-white border-b transition-all duration-300 ${
      scrolled ? 'border-secondary-200 shadow-md' : 'border-secondary-100'
    }`}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex items-center">
                <Link to={isAdmin ? '/admin' : '/'} className="flex items-center group">
                  <img src="/brand-logo.svg" alt="JanaSetu" className="h-10 sm:h-11 w-auto" />
                </Link>
                {!isAuthPage && (
                  <div className="hidden md:flex md:ml-8 md:space-x-0.5">
                    {navItems.map((item) => (
                      <NavLink key={item.name} name={item.name} href={item.href} isAdmin={isAdmin} />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                {isAuthenticated ? (
                  <>
                    <Menu as="div" className="relative">
                      <Menu.Button className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-secondary-100 transition-colors">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center bg-[#1a237e] text-white text-xs font-medium">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
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
                          <div className="px-4 py-3 border-b border-secondary-100">
                            <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                            <p className="text-xs text-secondary-500 mt-0.5">{user?.email}</p>
                          </div>
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link to="/account" className={`${active ? 'bg-secondary-50' : ''} block px-4 py-2 text-sm text-secondary-700 transition-colors`}>
                                  My Account
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link to="/my-applications" className={`${active ? 'bg-secondary-50' : ''} block px-4 py-2 text-sm text-secondary-700 transition-colors`}>
                                  My Applications
                                </Link>
                              )}
                            </Menu.Item>
                          </div>
                          <div className="border-t border-secondary-100 py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button onClick={handleLogout} className={`${active ? 'bg-red-50' : ''} w-full text-left px-4 py-2 text-sm text-red-600 transition-colors flex items-center gap-2`}>
                                  Logout
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>

                    <div className="relative hidden sm:block">
                      <button
                        onClick={() => setLangOpen(!langOpen)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
                      >
                        <span>{activeLang.native}</span>
                      </button>
                      {langOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                          <div className="absolute right-0 mt-1 w-36 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-20 overflow-hidden">
                            {languages.map(lang => (
                              <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary-50 flex items-center justify-between ${
                                  lang.code === currentLang ? 'text-blue-700 bg-blue-50' : 'text-secondary-600'
                                }`}
                              >
                                <span>{lang.native}</span>
                                {lang.code === currentLang && (
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Link to="/login?role=citizen" className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors">
                      Login
                    </Link>
                    <Link to="/register" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#FF9933] text-white hover:bg-[#ea580c] transition-colors">
                      Register
                    </Link>
                  </div>
                )}

                <Disclosure.Button className="md:hidden p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors">
                  {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="border-t border-secondary-100 bg-secondary-50 py-3 px-4">
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search schemes, services, information..."
                  className="flex-1 px-4 py-2 rounded-lg border border-secondary-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933]"
                  autoFocus
                />
                <button type="submit" className="px-4 py-2 bg-[#FF9933] text-white rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors">
                  Search
                </button>
              </form>
            </div>
          )}

          <Disclosure.Panel className="md:hidden border-t border-secondary-200">
            <div className="px-4 py-3 space-y-1">
              {!isAuthPage && navItems.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {!isAuthPage && (
                <Disclosure.Button
                  as={Link}
                  to="/account"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
                >
                  My Account
                </Disclosure.Button>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
