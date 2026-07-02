import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col relative ${
      isAdmin ? 'bg-gradient-to-br from-admin-50 via-white to-secondary-50' : 'bg-gradient-to-br from-primary-50/40 via-white to-secondary-50'
    }`}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-[0.08] ${
          isAdmin ? 'bg-admin-400' : 'bg-primary-400'
        } blur-3xl`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.06] ${
          isAdmin ? 'bg-admin-300' : 'bg-teal-300'
        } blur-3xl`} />
        {!isHome && (
          <div className={`absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-[0.04] ${
            isAdmin ? 'bg-admin-500' : 'bg-primary-500'
          } blur-3xl`} />
        )}
      </div>

      <Navbar />
      <div className="flex-1 flex relative z-10">
        {isAdmin && <Sidebar />}
        <main className={`flex-1 ${isAdmin ? 'lg:pl-64' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}