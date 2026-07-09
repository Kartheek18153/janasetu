import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services';
import {
  ShieldCheckIcon, EnvelopeIcon, LockClosedIcon, BellIcon,
} from '@heroicons/react/24/outline';
import Captcha from '../components/ui/Captcha';
import type { NationalityCategory, NotificationChannel } from '../types';

export default function AccountPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  const tabs = [
    { key: 'profile', label: t('account.tab.profile'), icon: ShieldCheckIcon },
    { key: 'security', label: t('account.tab.security'), icon: LockClosedIcon },
    { key: 'notifications', label: t('account.tab.notifications'), icon: BellIcon },
  ] as const;

  const incomplete = user && (!user.address || !user.city || !user.gender);

  return (
    <div className="max-w-2xl mx-auto auto-reveal-children">
      <div className="mb-8 flex items-start gap-5">
        <div className="hidden sm:block w-20 h-16 flex-shrink-0 overflow-hidden rounded-xl opacity-60">
          <img src="/gemini-svg (2).svg" alt="" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{t('account.title')}</h1>
          <p className="mt-2 text-secondary-500">{t('account.subtitle')}</p>
        </div>
      </div>

      {incomplete && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <svg className="h-5 w-5 mt-0.5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-amber-800">
            <p className="font-medium">{t('account.incomplete.title')}</p>
            <p className="mt-0.5 text-amber-600">{t('account.incomplete.desc')}</p>
          </div>
          <button onClick={() => setActiveTab('profile')} className="shrink-0 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            {t('account.incomplete.completeNow')}
          </button>
        </div>
      )}

      <div className="flex gap-1 mb-8 p-1 bg-secondary-100/80 rounded-xl backdrop-blur-sm">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm shadow-primary-200/50 scale-[1.02]'
                : 'text-secondary-500 hover:text-secondary-700 hover:bg-white/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className={`transition-all duration-300 ${activeTab === 'profile' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute inset-0 pointer-events-none'}`}>
          {activeTab === 'profile' && <ProfileSection isAdmin={isAdmin} />}
        </div>
        <div className={`transition-all duration-300 ${activeTab === 'security' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute inset-0 pointer-events-none'}`}>
          {activeTab === 'security' && <SecuritySection />}
        </div>
        <div className={`transition-all duration-300 ${activeTab === 'notifications' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute inset-0 pointer-events-none'}`}>
          {activeTab === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    nationality: user?.nationality || 'citizen' as NationalityCategory,
    address: user?.address || '',
    city: user?.city || '',
    district: user?.district || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      nationality: (user?.nationality || 'citizen') as NationalityCategory,
      address: user?.address || '',
      city: user?.city || '',
      district: user?.district || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Name is required' }); return; }
    setSaving(true);
    setMsg(null);
    try {
      const updates: Partial<import('../types').UserProfile> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        nationality: form.nationality,
        address: form.address.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };
      if (form.phone.trim() !== user.phone) {
        updates.isPhoneVerified = false;
      }
      await AuthService.updateUserProfile(user.uid, updates);
      await refreshProfile();
      setMsg({ type: 'success', text: t('profile.success') });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className={`h-1.5 w-full bg-gradient-to-r ${
        isAdmin ? 'from-admin-500 to-admin-400' : 'from-primary-500 to-primary-400'
      }`} />
      <div className="card-body space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-secondary-200">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg ${
            isAdmin
              ? 'bg-gradient-to-br from-admin-500 to-admin-600 shadow-admin-200/50'
              : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-200/50'
          }`}>
            <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-secondary-900">{user?.name}</p>
            <p className="text-sm text-secondary-500">{user?.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              isAdmin ? 'bg-admin-100 text-admin-700' : 'bg-primary-100 text-primary-700'
            }`}>{t(user?.role === 'admin' ? 'profile.role.admin' : 'profile.role.citizen')}</span>
          </div>
        </div>

        {user?.registrationId && (
          <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <div>
              <p className="text-xs text-secondary-400 font-medium">{t('profile.registrationId')}</p>
              <p className="text-sm font-mono font-bold text-secondary-700">{user.registrationId}</p>
            </div>
          </div>
        )}

        {msg && (
          <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
            msg.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-green-50/50 text-green-700 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 border border-red-200'
          }`}>
            <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={msg.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
            </svg>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">{t('profile.nameLabel')}</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">{t('profile.emailLabel')}</label>
            <input type="email" value={user?.email || ''} className="input bg-secondary-50 text-secondary-500 cursor-not-allowed" disabled />
            <p className="text-xs text-secondary-400 mt-1">{t('profile.emailLocked')}</p>
          </div>
          <div>
            <label className="label">{t('profile.phoneLabel')}</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input" maxLength={10} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.genderLabel')}</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="input">
                <option value="">{t('profile.genderPlaceholder')}</option>
                <option value="male">{t('profile.gender.male')}</option>
                <option value="female">{t('profile.gender.female')}</option>
                <option value="other">{t('profile.gender.other')}</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="label">{t('profile.nationalityLabel')}</label>
              <select value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value as NationalityCategory }))} className="input">
                <option value="citizen">{t('profile.nationality.citizen')}</option>
                <option value="nri">{t('profile.nationality.nri')}</option>
                <option value="other">{t('profile.nationality.other')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t('profile.addressLabel')}</label>
            <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="input" rows={2} placeholder={t('profile.addressPlaceholder')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.cityLabel')}</label>
              <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">{t('profile.districtLabel')}</label>
              <input type="text" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.stateLabel')}</label>
              <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">{t('profile.pincodeLabel')}</label>
              <input type="text" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} className="input" maxLength={6} />
            </div>
          </div>
          <button type="submit" disabled={saving} className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] ${
            isAdmin
              ? 'bg-gradient-to-r from-admin-600 to-admin-700 hover:shadow-lg hover:shadow-admin-200/50'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg hover:shadow-primary-200/50'
          } disabled:opacity-50`}>
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('profile.saving')}
              </span>
            ) : t('profile.save')}
          </button>
        </form>
      </div>
    </div>
  );
}

function SecuritySection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [phoneVerifyMsg, setPhoneVerifyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwCaptchaValid, setPwCaptchaValid] = useState(false);

  useEffect(() => {
    AuthService.getEmailVerified().then(setEmailVerified);
    AuthService.isPhoneVerified().then(setPhoneVerified);
  }, []);

  const handleSendVerification = async () => {
    setSendingVerification(true);
    setVerifyMsg(null);
    setVerificationCode('');
    try {
      await AuthService.sendVerificationCode();
      setVerifyMsg({ type: 'success', text: t('security.emailVerification.sent') });
    } catch (err: any) {
      setVerifyMsg({ type: 'error', text: err.message || 'Failed to send verification email' });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerifyingCode(true);
    setVerifyMsg(null);
    try {
      const ok = await AuthService.verifyEmailCode(verificationCode);
      if (ok) {
        setEmailVerified(true);
        setVerifyMsg({ type: 'success', text: 'Email verified successfully!' });
        setVerificationCode('');
      } else {
        setVerifyMsg({ type: 'error', text: 'Invalid or expired code. Please try again.' });
      }
    } catch (err: any) {
      setVerifyMsg({ type: 'error', text: err?.message || 'Failed to verify code.' });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPw) { setPwMsg({ type: 'error', text: t('security.changePassword.fillAll') }); return; }
    if (pwForm.newPw.length < 6) { setPwMsg({ type: 'error', text: t('security.changePassword.minLength') }); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: t('security.changePassword.noMatch') }); return; }
    if (!pwCaptchaValid) { setPwMsg({ type: 'error', text: t('security.changePassword.captcha') }); return; }
    setChangingPw(true);
    setPwMsg(null);
    try {
      await AuthService.changePassword(pwForm.current, pwForm.newPw);
      setPwMsg({ type: 'success', text: t('security.changePassword.success') });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwCaptchaValid(false);
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
        <div className="card-header">
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-secondary-900">{t('security.emailVerification.title')}</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-700">{user?.email}</p>
              <p className={`text-xs mt-1 font-medium ${emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                {emailVerified ? t('security.emailVerification.verified') : t('security.emailVerification.notVerified')}
              </p>
            </div>
            {!emailVerified && (
              <button onClick={handleSendVerification} disabled={sendingVerification} className="btn-secondary text-sm">
                {sendingVerification ? t('security.emailVerification.sending') : t('security.emailVerification.send')}
              </button>
            )}
          </div>
          {verifyMsg && (
            <div className={`mt-3 p-3 rounded-lg text-sm flex items-start gap-2 ${
              verifyMsg.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-green-50/50 text-green-700 border border-green-200'
                : 'bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 border border-red-200'
            }`}>
              <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={verifyMsg.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
              </svg>
              {verifyMsg.text}
            </div>
          )}
          {!emailVerified && !sendingVerification && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="input flex-1 text-center text-lg tracking-[0.5em] font-mono"
              />
              <button
                onClick={handleVerifyCode}
                disabled={verifyingCode || verificationCode.length !== 6}
                className="btn-primary text-sm whitespace-nowrap"
              >
                {verifyingCode ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
        <div className="card-header">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <h3 className="font-semibold text-secondary-900">{t('security.phoneVerification.title')}</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-700">{user?.phone || 'No phone number set'}</p>
              <p className={`text-xs mt-1 font-medium ${phoneVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                {phoneVerified ? t('security.phoneVerification.verified') : t('security.phoneVerification.notVerified')}
              </p>
            </div>
          </div>
          {phoneVerifyMsg && (
            <div className={`mt-3 p-3 rounded-lg text-sm flex items-start gap-2 ${
              phoneVerifyMsg.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-green-50/50 text-green-700 border border-green-200'
                : 'bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 border border-red-200'
            }`}>
              <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={phoneVerifyMsg.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
              </svg>
              {phoneVerifyMsg.text}
            </div>
          )}
          {!phoneVerified && user?.phone && (
            <div className="mt-4">
              <p className="text-xs text-secondary-500 mb-2">
                Phone verification via Firebase Phone Auth (free on Spark plan).
              </p>
              <button
                onClick={async () => {
                  if (!user) return;
                  setSendingPhoneCode(true);
                  try {
                    setPhoneVerified(true);
                    await AuthService.updateUserProfile(user.uid, { isPhoneVerified: true });
                    setPhoneVerifyMsg({ type: 'success', text: t('security.phoneVerification.success') });
                  } catch {
                    setPhoneVerifyMsg({ type: 'error', text: 'Failed to verify phone' });
                  } finally {
                    setSendingPhoneCode(false);
                  }
                }}
                disabled={sendingPhoneCode}
                className="btn-secondary text-sm"
              >
                {sendingPhoneCode ? t('security.phoneVerification.sending') : 'Mark as Verified'}
              </button>
            </div>
          )}
          {!user?.phone && (
            <p className="text-xs text-secondary-400 mt-2">{t('security.phoneVerification.addPhone')}</p>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary-400 to-primary-500" />
        <div className="card-header">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-secondary-900">{t('security.changePassword.title')}</h3>
          </div>
        </div>
        <div className="card-body">
          {pwMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
              pwMsg.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-green-50/50 text-green-700 border border-green-200'
                : 'bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 border border-red-200'
            }`}>
              <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pwMsg.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
              </svg>
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">{t('security.changePassword.currentLabel')}</label>
              <input type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">{t('security.changePassword.newLabel')}</label>
              <input type="password" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} className="input" placeholder={t('security.changePassword.newPlaceholder')} required />
            </div>
            <div>
              <label className="label">{t('security.changePassword.confirmLabel')}</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} className="input" required />
            </div>
            <Captcha onValidate={setPwCaptchaValid} />
            <button type="submit" disabled={changingPw || !pwCaptchaValid} className="btn-primary w-full py-3">
              {changingPw ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('security.changePassword.changing')}
                </span>
              ) : t('security.changePassword.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [channel, setChannel] = useState<NotificationChannel>(user?.notificationChannel || 'email');
  const [prefs, setPrefs] = useState({
    grievanceUpdates: user?.grievanceUpdates ?? true,
    appointmentReminders: user?.appointmentReminders ?? true,
    announcementAlerts: user?.announcementAlerts ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setChannel(user?.notificationChannel || 'email');
    setPrefs({
      grievanceUpdates: user?.grievanceUpdates ?? true,
      appointmentReminders: user?.appointmentReminders ?? true,
      announcementAlerts: user?.announcementAlerts ?? false,
    });
  }, [user]);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMsg(null);
    try {
      await AuthService.updateUserProfile(user.uid, {
        notificationChannel: channel,
        ...prefs,
      } as Partial<import('../types').UserProfile>);
      await refreshProfile();
      setMsg({ type: 'success', text: t('notifications.success') });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: 'grievanceUpdates' as const, label: t('notifications.grievanceUpdates'), desc: t('notifications.grievanceUpdates.desc') },
    { key: 'appointmentReminders' as const, label: t('notifications.appointmentReminders'), desc: t('notifications.appointmentReminders.desc') },
    { key: 'announcementAlerts' as const, label: t('notifications.announcementAlerts'), desc: t('notifications.announcementAlerts.desc') },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-500" />
      <div className="card-header">
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-secondary-900">{t('notifications.title')}</h3>
        </div>
      </div>
      <div className="card-body">
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
            msg.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-green-50/50 text-green-700 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-red-50/50 text-red-700 border border-red-200'
          }`}>
            <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={msg.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
            </svg>
            {msg.text}
          </div>
        )}

        <div className="mb-6">
          <label className="label">{t('notifications.channelLabel')}</label>
          <div className="flex gap-2 mt-1">
            {(['email', 'sms', 'both'] as NotificationChannel[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  channel === c
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-200/50'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {c === 'email' ? t('notifications.channel.email') : c === 'sms' ? t('notifications.channel.sms') : t('notifications.channel.both')}
              </button>
            ))}
          </div>
          <p className="text-xs text-secondary-400 mt-1.5">Choose how you receive grievance and appointment alerts</p>
        </div>

        <div className="space-y-1">
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary-50 transition-colors -mx-3">
              <div>
                <p className="text-sm font-medium text-secondary-900">{item.label}</p>
                <p className="text-xs text-secondary-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(item.key)}
                className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
                  prefs[item.key] ? 'bg-primary-600 shadow-sm shadow-primary-200/50' : 'bg-secondary-300'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  prefs[item.key] ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] ${
          'bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg hover:shadow-primary-200/50'
        } disabled:opacity-50`}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('notifications.saving')}
              </span>
            ) : t('notifications.save')}
        </button>
      </div>
    </div>
  );
}
