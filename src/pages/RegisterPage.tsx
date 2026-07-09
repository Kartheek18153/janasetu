import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services';
import { isDisposableEmail } from '../utils/emailValidation';
import Captcha from '../components/ui/Captcha';
import { useTranslation } from '../i18n';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showVerify, setShowVerify] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);

  const update = (f: string, v: string) => { setForm(prev => ({ ...prev, [f]: v })); setTouched(prev => ({ ...prev, [f]: true })); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (await isDisposableEmail(form.email)) {
      setError('Temporary email addresses are not allowed. Please use a permanent email.'); return;
    }
    if (await AuthService.checkNameExists(form.name)) {
      setError('This username is already taken. Please choose another.'); return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ email: form.email, password: form.password, name: form.name });
      await AuthService.sendVerificationCode();
      setShowVerify(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    try {
      const ok = await AuthService.verifyEmailCode(verificationCode);
      if (ok) {
        setVerificationSuccess(true);
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('Invalid or expired code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to verify code.');
    } finally {
      setCheckingVerification(false);
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
          <div className="card">
          <div className="card-body p-8">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-xl overflow-hidden mx-auto mb-4 shadow-lg shadow-primary-300/50 ring-4 ring-primary-100">
                <img src="/logo.png" alt="JanaSetu" className="h-full w-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">{t('register.title')}</h2>
              <p className="text-sm text-secondary-500 mt-1">{t('register.subtitle')}</p>
            </div>

            {!showVerify ? (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">{t('register.nameLabel')}</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={`input ${touched.name && !form.name ? 'border-red-300' : ''}`}
                      placeholder={t('register.namePlaceholder')}
                      required
                    />
                    {touched.name && !form.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
                  </div>
                  <div>
                    <label className="label">{t('register.emailLabel')}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={`input ${touched.email && !form.email ? 'border-red-300' : ''}`}
                      placeholder={t('register.emailPlaceholder')}
                      required
                    />
                    {touched.email && !form.email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
                  </div>
                  <div>
                    <label className="label">{t('register.passwordLabel')}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        className={`input pr-10 ${touched.password && !form.password ? 'border-red-300' : ''}`}
                        placeholder={t('register.passwordPlaceholder')}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {touched.password && !form.password && <p className="text-xs text-red-500 mt-1">Password is required</p>}
                  </div>
                  <div>
                    <label className="label">{t('register.confirmPasswordLabel')}</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        className={`input pr-10 ${touched.confirmPassword && !form.confirmPassword ? 'border-red-300' : ''}`}
                        placeholder={t('register.confirmPasswordPlaceholder')}
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                        {showConfirm ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {touched.confirmPassword && !form.confirmPassword && <p className="text-xs text-red-500 mt-1">Please confirm your password</p>}
                  </div>
                  <Captcha onValidate={setCaptchaValid} />
                  <button type="submit" disabled={loading || !captchaValid} className="btn-primary w-full">
                    {loading ? t('register.registering') : t('register.submit')}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-secondary-500">
                  {t('register.haveAccount')} <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">{t('register.signIn')}</Link>
                </p>
              </>
            ) : (
              <div className="text-center">
                {verificationSuccess ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">Email Verified!</h3>
                    <p className="text-sm text-secondary-500">Redirecting you to the app...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">{t('register.verifyTitle')}</h3>
                    <p className="text-sm text-secondary-500 mb-1">
                      A 6-digit verification code has been sent to <strong>{form.email}</strong>.
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
