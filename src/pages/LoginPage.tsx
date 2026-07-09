import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services';
import { useTranslation } from '../i18n';

export default function LoginPage() {
  const { login, loginWithGoogle, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showVerify, setShowVerify] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
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
      const verified = await AuthService.getEmailVerified();
      if (!verified) {
        await AuthService.sendVerificationCode();
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

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    try {
      const ok = await AuthService.verifyEmailCode(verificationCode);
      if (ok) {
        setEmailVerified(true);
        await refreshProfile();
        setTimeout(() => {
          const role = AuthService.getCurrentUser().then(u => {
            navigate(u?.role === 'admin' ? '/admin' : redirect);
          });
        }, 1000);
      } else {
        setError('Invalid or expired code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to verify code.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const userProfile = await loginWithGoogle();
      const verified = await AuthService.getEmailVerified();
      if (!verified) {
        await AuthService.sendVerificationCode();
        setShowVerify(true);
        setGoogleLoading(false);
        return;
      }
      navigate(userProfile.role === 'admin' ? '/admin' : redirect);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative h-full flex items-center justify-center px-4 py-4">
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundColor: '#fef0db' }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.35]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23f3722c\' fill-opacity=\'0.3\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }}
      />
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
          <div className="p-6">
            {error && !showVerify && (
              <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

                {showVerify ? (
              <div className="text-center">
                {emailVerified ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">Email Verified!</h3>
                    <p className="text-sm text-secondary-500 mb-4">Redirecting you to the app...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">Verify Your Email</h3>
                    <p className="text-sm text-secondary-500 mb-1">
                      A 6-digit verification code has been sent to <strong>{email}</strong>.
                    </p>
                    <p className="text-xs text-secondary-400 mb-4">
                      Enter the code below to verify your account. Check your spam folder if you don't see it.
                    </p>
                    <div className="mb-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="input text-center text-lg tracking-[0.5em] font-mono"
                      />
                    </div>
                    {error && (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">{error}</div>
                    )}
                    <button
                      onClick={handleCheckVerification}
                      disabled={checkingVerification || verificationCode.length !== 6}
                      className="btn-primary w-full mb-2"
                    >
                      {checkingVerification ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await AuthService.sendVerificationCode();
                          setError('');
                          setVerificationCode('');
                        } catch {
                          setError('Failed to resend verification code.');
                        }
                      }}
                      className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors"
                    >
                      Resend Code
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Google Sign-In */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary-300 rounded-xl text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 hover:border-secondary-400 transition-all duration-200 active:scale-[0.98] hover:shadow-sm mb-4"
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
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-secondary-400">or</span>
                  </div>
                </div>

                {/* Email/Password Login */}
                <div className="border border-secondary-200 rounded-xl overflow-hidden">
                  <div className="border-b border-secondary-100 px-4 py-3 bg-secondary-50">
                    <p className="text-sm font-medium text-secondary-700">Sign in with Email</p>
                  </div>
                  <div className="px-4 pb-4">
                    <form onSubmit={handleSubmit} className="space-y-3 pt-3">
                      <div>
                        <label className="text-xs font-medium text-secondary-600 mb-1 block">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); touchField('email'); }}
                          className={`input text-sm ${touched.email && !email ? 'border-red-300' : ''}`}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-secondary-600 mb-1 block">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); touchField('password'); }}
                            className={`input text-sm pr-10 ${touched.password && !password ? 'border-red-300' : ''}`}
                            placeholder="Min 6 characters"
                            required
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                            {showPassword ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                        <div className="flex justify-between mt-1">
                          <button type="button" onClick={async () => {
                            if (!email) { setError('Enter your registered email first'); return; }
                            setLoading(true);
                            try {
                              const regId = await AuthService.lookupRegistrationId(email);
                              setError(regId ? `Your Registration ID: ${regId}` : `Your Login ID is your registered email: ${email}`);
                            } catch {
                              setError(`Your Login ID is your registered email: ${email}`);
                            } finally { setLoading(false); }
                          }} className="text-xs text-primary-600 hover:text-primary-700">Forgot Login ID?</button>
                          <button type="button" onClick={() => AuthService.resetPassword(email).then(() => setError('Password reset link sent to your email')).catch(() => setError('Enter your registered email first'))} className="text-xs text-primary-600 hover:text-primary-700">Forgot Password?</button>
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg transition-all disabled:opacity-50">
                        {loading ? 'Signing in...' : 'Sign In'}
                      </button>
                    </form>
                  </div>
                </div>

                <p className="mt-5 text-center text-sm text-secondary-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">Create one</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
