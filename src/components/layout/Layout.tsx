import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AccessibilityBar from './AccessibilityBar';
import VoiceAssistant from '../voice/VoiceAssistant';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { sendVerificationCodeEmail } from '../../services/emailService';
import AppService from '../../services/appService';
import { auth } from '../../firebase/config';

export default function Layout() {
  const { t } = useTranslation();
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
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Indian Tricolor Top Stripe */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Government of India Header Bar */}
      <div className="bg-[#1a237e] text-white text-xs shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-medium">GOVERNMENT OF INDIA</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="text-white/80">JanaSetu — Citizen Grievance Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/schemes" className="text-white/70 hover:text-white transition-colors">Schemes</Link>
            <span className="text-white/30">|</span>
            <Link to="/documents" className="text-white/70 hover:text-white transition-colors">Documents</Link>
            <span className="text-white/30">|</span>
            <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">India Portal</a>
            <span className="text-white/30">|</span>
            <AccessibilityBar />
          </div>
        </div>
      </div>

      <div key={location.pathname} className="animate-page-enter flex flex-col flex-1">
        <Navbar />

        {isAuthenticated && !isVerified && !isAdmin && (
          <div className="relative z-10 bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{t('common.emailNotVerified')}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {codeSent && (
                  <span className="text-xs text-emerald-600 font-medium">{t('common.codeSent')}</span>
                )}
                <button
                  onClick={handleResendCode}
                  disabled={sendingCode}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  {sendingCode ? t('common.sending') : t('common.resendCode')}
                </button>
                <Link
                  to="/account"
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors"
                >
                  {t('common.verifyNow')}
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

        {isAuthenticated && <VoiceAssistant />}
        <Footer />
      </div>
    </div>
  );
}
