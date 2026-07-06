import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppService from '../services/appService';
import { sendVerificationCodeEmail, sendVerificationCodeSMS } from '../services/emailService';
import { auth } from '../firebase/config';
import { useTranslation } from '../i18n';

type LoginRole = 'citizen' | 'admin';

export default function LoginPage() {
  const { login, loginWithGoogle, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') as LoginRole;
  const redirect = searchParams.get('redirect') || '/';
  const [role, setRole] = useState<LoginRole>(roleParam || 'citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showVerify, setShowVerify] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [resending, setResending] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [codeSendError, setCodeSendError] = useState('');
  const [fallbackCode, setFallbackCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const { t } = useTranslation();

  const touchField = (f: string) => setTouched(prev => ({ ...prev, [f]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const userProfile = await login(email, password);
      if (role === 'admin' && userProfile.role !== 'admin') {
        setError('Access denied. This account does not have admin privileges.');
        setLoading(false);
        return;
      }
      const verified = await AppService.isEmailVerified();
      if (!verified) {
        const uid = auth.currentUser?.uid || null;
        setPendingUid(uid);
        setPendingName(userProfile.name);
        setPendingPhone(userProfile.phone || '');
        const code = await AppService.generateVerificationCode(uid!);
        setFallbackCode(code);
        try {
          await sendVerificationCodeEmail(email, code, userProfile.name);
        } catch (emailErr: any) {
          setCodeSendError(emailErr.message || 'Email delivery failed. Your verification code is shown below.');
        }
        setShowVerify(true);
        setLoading(false);
        return;
      }
      navigate(userProfile.role === 'admin' ? '/admin' : redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!pendingUid) return;
    setVerifyError('');
    const ok = await AppService.verifyEmailCode(pendingUid, enteredCode);
    if (ok) {
      await refreshProfile();
      const snap = await AppService.getCurrentUser();
      navigate(snap?.role === 'admin' ? '/admin' : redirect);
    } else {
      setVerifyError('Invalid or expired verification code');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const userProfile = await loginWithGoogle();
      const uid = auth.currentUser?.uid || null;
      if (!uid) { setGoogleLoading(false); return; }
      const code = await AppService.generateVerificationCode(uid);
      setFallbackCode(code);
      setPendingUid(uid);
      setPendingName(userProfile.name);
      try {
        await sendVerificationCodeEmail(userProfile.email, code, userProfile.name);
      } catch (emailErr: any) {
        setCodeSendError(emailErr.message || 'Email delivery failed. Your verification code is shown below.');
      }
      setShowVerify(true);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Full-window background */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundColor: '#fef0db' }} />
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.35]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23f3722c\' fill-opacity=\'0.3\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }}
      />
      {/* Background JS watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.04]">
        <img src="/logo.png" alt="" className="w-[35vw] h-auto select-none" />
      </div>
      <style>{`html, body { background-color: #fef0db !important; }`}</style>
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-primary-700 mb-1">JanaSetu</div>
          <div className="h-16 w-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg shadow-primary-300/50 ring-4 ring-primary-100">
            <img src="/logo.png" alt="JanaSetu" className="h-full w-full object-cover" />
          </div>
          <p className="text-sm text-secondary-500">Smart Grievance Tracking System</p>
        </div>

        <div className="card overflow-hidden shadow-lg shadow-secondary-200/50">
          {/* Role Tabs */}
          <div className="flex bg-secondary-50 p-1.5 gap-1">
            <button
              onClick={() => setRole('citizen')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-center rounded-lg transition-all duration-300 ${
                role === 'citizen'
                  ? 'bg-white text-primary-700 shadow-sm shadow-primary-200/50 scale-[1.02]'
                  : 'text-secondary-500 hover:text-secondary-700 bg-transparent'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Citizen
              </span>
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-center rounded-lg transition-all duration-300 ${
                role === 'admin'
                  ? 'bg-white text-admin-700 shadow-sm shadow-admin-200/50 scale-[1.02]'
                  : 'text-secondary-500 hover:text-secondary-700 bg-transparent'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Admin
              </span>
            </button>
          </div>

          <div className="p-6">
            {role === 'admin' && (
              <div className="mb-4 p-3 bg-gradient-to-r from-admin-50 to-admin-50/50 border border-admin-100 rounded-lg text-xs text-admin-700">
                Admin login — only for authorized government officials.
              </div>
            )}

            {error && !showVerify && (
              <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            {showVerify ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">{t('login.verifyTitle')}</h3>
                <p className="text-sm text-secondary-500 mb-3">
                  A verification code has been sent to <strong>{email}</strong>.
                </p>
                {pendingPhone && (
                  <p className="text-xs text-secondary-400 mb-3">
                    Also sent via SMS to <strong>{pendingPhone}</strong>
                    {smsSent && <span className="text-emerald-600 ml-1">✓</span>}
                  </p>
                )}
                {codeSendError && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    {codeSendError}
                  </div>
                )}
                {!showCode ? (
                  <div className="mb-3">
                    <p className="text-xs text-secondary-400 mb-2">
                      Can't find the code? <button onClick={() => setShowCode(true)} className="text-primary-600 hover:text-primary-700 font-medium underline">Show code</button>
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-xs text-primary-600 font-medium mb-1">Your verification code</p>
                    <p className="text-3xl font-mono font-bold text-primary-700 tracking-[0.25em]">{fallbackCode}</p>
                  </div>
                )}
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`input text-center text-2xl font-mono tracking-widest mb-3 ${verifyError ? 'border-red-300' : ''}`}
                  placeholder={t('login.verifyCodePlaceholder')}
                  maxLength={6}
                />
                {verifyError && <p className="text-xs text-red-500 mb-3">{verifyError}</p>}
                <button onClick={handleVerifyCode} disabled={enteredCode.length !== 6} className="btn-primary w-full mb-2">
                  {t('login.verifySubmit')}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!pendingUid) return;
                      setResending(true);
                      setCodeSendError('');
                      try {
                        const code = await AppService.generateVerificationCode(pendingUid);
                        setFallbackCode(code);
                        setShowCode(true);
                        await sendVerificationCodeEmail(email, code, pendingName);
                      } catch (emailErr: any) {
                        setCodeSendError(emailErr.message || 'Email delivery failed.');
                      } finally {
                        setResending(false);
                      }
                    }}
                    disabled={resending}
                    className="flex-1 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 py-2 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors"
                  >
                    {resending ? 'Resending...' : t('login.resendCode')}
                  </button>
                  {pendingPhone && (
                    <button
                      onClick={async () => {
                        if (!pendingUid || !pendingPhone) return;
                        setSendingSms(true);
                        setSmsSent(false);
                        try {
                          const code = await AppService.generateVerificationCode(pendingUid);
                          setFallbackCode(code);
                          setShowCode(true);
                          const ok = await sendVerificationCodeSMS(pendingPhone, code, pendingName);
                          if (ok) {
                            setSmsSent(true);
                          } else {
                            setCodeSendError('SMS delivery unavailable. Your code is shown above.');
                          }
                        } finally {
                          setSendingSms(false);
                        }
                      }}
                      disabled={sendingSms}
                      className="flex-1 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 py-2 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors"
                    >
                      {sendingSms ? 'Sending...' : smsSent ? 'Sent ✓' : 'Send as SMS'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary-300 rounded-xl text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 hover:border-secondary-400 transition-all duration-200 active:scale-[0.98] hover:shadow-sm"
                >
                  {googleLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary-400 border-t-primary-600" />
                  ) : (
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  {googleLoading ? t('login.googleSigningIn') : t('login.googleSignIn')}
                </button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-secondary-400">{t('login.orContinueWith')}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">{t('login.emailLabel')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); touchField('email'); }}
                      className={`input ${touched.email && !email ? 'border-red-300' : ''}`}
                      placeholder={t('login.emailPlaceholder')}
                      required
                    />
                    {touched.email && !email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
                  </div>
                  <div>
                    <label className="label">{t('login.passwordLabel')}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); touchField('password'); }}
                        className={`input pr-10 ${touched.password && !password ? 'border-red-300' : ''}`}
                        placeholder={t('login.passwordPlaceholder')}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors">
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {touched.password && !password && <p className="text-xs text-red-500 mt-1">Password is required</p>}
                    <div className="flex justify-between mt-1">
                      <button type="button" onClick={async () => {
                        if (!email) { setError('Enter your registered email first'); return; }
                        setLoading(true);
                        try {
                          const regId = await AppService.lookupRegistrationId(email);
                          if (regId) {
                            setError(`Your Registration ID: ${regId}. Login with your email: ${email}`);
                          } else {
                            setError(`Your Login ID is your registered email: ${email}`);
                          }
                        } catch {
                          setError(`Your Login ID is your registered email: ${email}`);
                        } finally {
                          setLoading(false);
                        }
                      }} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        {t('login.forgotLoginId')}
                      </button>
                      <button type="button" onClick={() => AppService.resetPassword(email).then(() => {
                        setError(t('common.passwordResetSent'));
                      }).catch(() => {
                        setError('Enter your registered email to reset password');
                      })} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        {t('login.forgotPassword')}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] ${
                    role === 'admin'
                      ? 'bg-gradient-to-r from-admin-600 to-admin-700 hover:shadow-lg hover:shadow-admin-200/50'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg hover:shadow-primary-200/50'
                  } disabled:opacity-50`}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('login.signingIn')}
                      </span>
                    ) : t('login.submit')}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-secondary-500">
                  {t('login.noAccount')}{' '}
                  <Link to="/register" className={`font-semibold transition-colors ${
                    role === 'admin' ? 'text-admin-600 hover:text-admin-700' : 'text-primary-600 hover:text-primary-700'
                  }`}>{t('login.registerLink')}</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}