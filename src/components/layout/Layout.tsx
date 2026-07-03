import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { sendVerificationCodeEmail } from '../../services/emailService';
import AppService from '../../services/appService';
import { auth } from '../../firebase/config';

export default function Layout() {
  const { isAdmin, isAuthenticated, isVerified, user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleResendCode = async () => {
    if (!auth.currentUser || !user) return;
    setSendingCode(true);
    try {
      const code = await AppService.generateVerificationCode(auth.currentUser.uid);
      await sendVerificationCodeEmail(user.email, code, user.name);
      setCodeSent(true);
      setTimeout(() => setCodeSent(false), 5000);
    } catch {
      // email send failed silently, banner stays visible
    } finally {
      setSendingCode(false);
    }
  };

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
      {isAuthenticated && !isVerified && !isAdmin && (
        <div className="relative z-10 bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Your email is not verified. Please verify to access all features.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {codeSent && (
                <span className="text-xs text-emerald-600 font-medium">Code sent!</span>
              )}
              <button
                onClick={handleResendCode}
                disabled={sendingCode}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                {sendingCode ? 'Sending...' : 'Resend Code'}
              </button>
              <Link
                to="/account"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors"
              >
                Verify Now
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex relative z-10">
        {isAdmin && <Sidebar />}
        <main className={`flex-1 ${isAdmin ? 'lg:pl-64' : ''}`}>
          {isHome ? (
            <Outlet />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}