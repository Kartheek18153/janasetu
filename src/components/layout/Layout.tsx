import { useState, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AccessibilityBar from './AccessibilityBar';
import VoiceAssistant from '../voice/VoiceAssistant';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services';
import { useGlobalReveal } from '../../hooks/useScrollReveal';

export default function Layout() {
  const { t } = useTranslation();
  const { isAdmin, isAuthenticated, isVerified, refreshProfile } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  useGlobalReveal(mainRef, [location.pathname]);

  const handleSendCode = async () => {
    setSendingCode(true);
    setCodeError('');
    try {
      const code = await AuthService.sendVerificationCode();
      setVerificationCode(code);
      setCodeSent(true);
      console.log('Verification code (for testing):', code);
      setTimeout(() => setCodeSent(false), 8000);
    } catch {
      setCodeError('Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (codeInput.length !== 6) return;
    setVerifying(true);
    setCodeError('');
    try {
      const ok = await AuthService.verifyEmailCode(codeInput);
      if (ok) {
        await refreshProfile();
        setCodeInput('');
        setCodeError('');
      } else {
        setCodeError('Invalid or expired code');
      }
    } catch {
      setCodeError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Background subtle pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,153,51,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,153,51,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Indian Tricolor Top Stripe */}
      <div className="h-1.5 w-full flex shrink-0 relative z-20">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Government of India Header Bar */}
      <div className="flex flex-col flex-1">
        <div className="bg-[#1a237e] text-white text-xs shrink-0 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline font-medium tracking-wide">GOVERNMENT OF INDIA</span>
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

        <Navbar />

        {isAuthenticated && !isVerified && !isAdmin && (
          <div className="relative z-10 bg-amber-50 border-b border-amber-200 animate-slide-up">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{t('common.emailNotVerified')}</span>
              </div>

              {!codeSent && !codeInput ? (
                <button
                  onClick={handleSendCode}
                  disabled={sendingCode}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {sendingCode ? 'Sending...' : 'Verify Email'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codeInput}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCodeInput(val);
                      setCodeError('');
                    }}
                    placeholder="Enter 6-digit code"
                    className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 text-center tracking-widest font-mono"
                    autoFocus
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={codeInput.length !== 6 || verifying}
                    className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {verifying ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 px-2 py-1.5 rounded-lg hover:bg-amber-100/50 transition-colors disabled:opacity-50"
                    title="Resend code"
                  >
                    Resend
                  </button>
                </div>
              )}

              {codeError && (
                <span className="text-xs text-red-600 font-medium animate-fade-in">{codeError}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex relative z-10">
          {isAdmin && <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />}
          <main ref={mainRef} className={`flex-1 ${isAdmin ? (sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64') : ''} ${isAuthPage ? 'overflow-hidden' : ''}`}>
            {isHome ? (
              <Outlet />
            ) : isAuthPage ? (
              <Outlet />
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
              </div>
            )}
          </main>
        </div>

        {isAuthenticated && <VoiceAssistant />}
        <Footer compact={isAdmin} />
      </div>
    </div>
  );
}
