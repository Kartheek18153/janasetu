import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppService from '../services/appService';
import { sendVerificationCodeEmail } from '../services/emailService';
import { auth } from '../firebase/config';
import { isDisposableEmail } from '../utils/emailValidation';

export default function RegisterPage() {
  const { register, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [enteredCode, setEnteredCode] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeSendError, setCodeSendError] = useState('');
  const [fallbackCode, setFallbackCode] = useState('');
  const [resending, setResending] = useState(false);

  const update = (f: string, v: string) => { setForm(prev => ({ ...prev, [f]: v })); setTouched(prev => ({ ...prev, [f]: true })); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
    if (!form.name || !form.email || !form.phone || !form.password) {
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
    if (await AppService.checkNameExists(form.name)) {
      setError('This username is already taken. Please choose another.'); return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ email: form.email, password: form.password, name: form.name, phone: form.phone });
      const code = await AppService.generateVerificationCode(auth.currentUser!.uid);
      setFallbackCode(code);
      try {
        await sendVerificationCodeEmail(form.email, code, form.name);
        setCodeSent(true);
      } catch (emailErr: any) {
        setCodeSendError(emailErr.message || 'Email delivery failed. Your verification code is shown below.');
      }
      setShowVerify(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!auth.currentUser) return;
    setVerifyError('');
    const ok = await AppService.verifyEmailCode(auth.currentUser.uid, enteredCode);
    if (ok) {
      await refreshProfile();
      navigate('/');
    } else {
      setVerifyError('Invalid or expired verification code');
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
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-primary-700 mb-2">JanaSetu</div>
        </div>
        <div className="card">
          <div className="card-body p-8">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-xl overflow-hidden mx-auto mb-4 shadow-lg shadow-primary-300/50 ring-4 ring-primary-100">
                <img src="/logo.png" alt="JanaSetu" className="h-full w-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900">Create Account</h2>
              <p className="text-sm text-secondary-500 mt-1">Register as a citizen to file and track grievances</p>
            </div>

            {!showVerify ? (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={`input ${touched.name && !form.name ? 'border-red-300' : ''}`}
                      placeholder="Your full name"
                      required
                    />
                    {touched.name && !form.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={`input ${touched.email && !form.email ? 'border-red-300' : ''}`}
                      placeholder="you@example.com"
                      required
                    />
                    {touched.email && !form.email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className={`input ${touched.phone && !form.phone ? 'border-red-300' : ''}`}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                    {touched.phone && !form.phone && <p className="text-xs text-red-500 mt-1">Phone number is required</p>}
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        className={`input pr-10 ${touched.password && !form.password ? 'border-red-300' : ''}`}
                        placeholder="Min 6 characters"
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
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        className={`input pr-10 ${touched.confirmPassword && !form.confirmPassword ? 'border-red-300' : ''}`}
                        placeholder="Re-enter password"
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
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-secondary-500">
                  Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">Verify Your Email</h3>
                <p className="text-sm text-secondary-500 mb-4">
                  A verification code has been sent to <strong>{form.email}</strong>. 
                  Please check your inbox and enter the code below. (Valid for 5 minutes)
                </p>
                {codeSendError && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    {codeSendError}
                  </div>
                )}
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`input text-center text-2xl font-mono tracking-widest mb-3 ${verifyError ? 'border-red-300' : ''}`}
                  placeholder="Enter code"
                  maxLength={6}
                />
                {verifyError && <p className="text-xs text-red-500 mb-3">{verifyError}</p>}
                <button onClick={handleVerifyCode} disabled={enteredCode.length !== 6} className="btn-primary w-full">
                  Verify & Continue
                </button>
                <button
                  onClick={async () => {
                    if (!auth.currentUser) return;
                    setResending(true);
                    setCodeSendError('');
                    try {
                      const code = await AppService.generateVerificationCode(auth.currentUser.uid);
                      setFallbackCode(code);
                      await sendVerificationCodeEmail(form.email, code, form.name);
                      setCodeSent(true);
                    } catch (emailErr: any) {
                      setCodeSendError(emailErr.message || 'Email delivery failed. Your verification code is shown below.');
                    } finally {
                      setResending(false);
                    }
                  }}
                  disabled={resending}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}