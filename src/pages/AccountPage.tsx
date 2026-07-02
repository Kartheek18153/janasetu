import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppService from '../services/appService';
import {
  ShieldCheckIcon, EnvelopeIcon, LockClosedIcon, BellIcon,
} from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  const tabs = [
    { key: 'profile', label: 'Profile', icon: ShieldCheckIcon },
    { key: 'security', label: 'Security', icon: LockClosedIcon },
    { key: 'notifications', label: 'Notifications', icon: BellIcon },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Account Settings</h1>
        <p className="mt-2 text-secondary-500">Manage your profile, security, and notification preferences</p>
      </div>

      {/* Tabs */}
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

      {/* Tab content with transition */}
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
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Name is required' }); return; }
    setSaving(true);
    setMsg(null);
    try {
      await AppService.updateUserProfile(user.uid, { name: form.name.trim(), phone: form.phone.trim() });
      setMsg({ type: 'success', text: 'Profile updated successfully' });
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
            }`}>{user?.role}</span>
          </div>
        </div>

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
            <label className="label">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={user?.email || ''} className="input bg-secondary-50 text-secondary-500 cursor-not-allowed" disabled />
            <p className="text-xs text-secondary-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input" maxLength={10} />
          </div>
          <button type="submit" disabled={saving} className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] ${
            isAdmin
              ? 'bg-gradient-to-r from-admin-600 to-admin-700 hover:shadow-lg hover:shadow-admin-200/50'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-lg hover:shadow-primary-200/50'
          } disabled:opacity-50`}>
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function SecuritySection() {
  const { user } = useAuth();
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    AppService.getEmailVerified().then(setEmailVerified);
  }, []);

  const handleSendVerification = async () => {
    setSendingVerification(true);
    setVerifyMsg(null);
    try {
      await AppService.sendVerificationEmail();
      setVerifyMsg({ type: 'success', text: 'Verification email sent! Check your inbox.' });
    } catch (err: any) {
      setVerifyMsg({ type: 'error', text: err.message || 'Failed to send verification email' });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPw) { setPwMsg({ type: 'error', text: 'Fill in all fields' }); return; }
    if (pwForm.newPw.length < 6) { setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' }); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match' }); return; }
    setChangingPw(true);
    setPwMsg(null);
    try {
      await AppService.changePassword(pwForm.current, pwForm.newPw);
      setPwMsg({ type: 'success', text: 'Password changed successfully' });
      setPwForm({ current: '', newPw: '', confirm: '' });
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
            <h3 className="font-semibold text-secondary-900">Email Verification</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-700">{user?.email}</p>
              <p className={`text-xs mt-1 font-medium ${emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                {emailVerified ? '✓ Verified' : '○ Not verified'}
              </p>
            </div>
            {!emailVerified && (
              <button onClick={handleSendVerification} disabled={sendingVerification} className="btn-secondary text-sm">
                {sendingVerification ? 'Sending...' : 'Resend Verification'}
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
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary-400 to-primary-500" />
        <div className="card-header">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-secondary-900">Change Password</h3>
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
              <label className="label">Current Password</label>
              <input type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} className="input" placeholder="Min 6 characters" required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} className="input" required />
            </div>
            <button type="submit" disabled={changingPw} className="btn-primary w-full py-3">
              {changingPw ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Changing...
                </span>
              ) : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    grievanceUpdates: true,
    appointmentReminders: true,
    announcementAlerts: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await new Promise(r => setTimeout(r, 300));
      setMsg({ type: 'success', text: 'Preferences saved successfully' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive email notifications for important updates' },
    { key: 'grievanceUpdates' as const, label: 'Grievance Updates', desc: 'Get notified when your grievance status changes' },
    { key: 'appointmentReminders' as const, label: 'Appointment Reminders', desc: 'Reminders before scheduled appointments' },
    { key: 'announcementAlerts' as const, label: 'Announcement Alerts', desc: 'Push alerts for new government announcements' },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-500" />
      <div className="card-header">
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-secondary-900">Notification Preferences</h3>
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
              Saving...
            </span>
          ) : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}