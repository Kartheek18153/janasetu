import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppService from '../services/appService';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Officer, Appointment, TimeSlot } from '../types';

export default function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    department: '', officerId: '', purpose: '', preferredDate: '', preferredTimeSlot: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [depts, offs, apps] = await Promise.all([
          AppService.getDepartments(),
          AppService.getOfficers(),
          user ? AppService.getAppointmentsByCitizen(user.uid) : Promise.resolve([]),
        ]);
        setDepartments(depts.map(d => d.name));
        setOfficers(offs);
        if (offs.length === 0) setError('No officers found. Make sure the seed data has run on first load.');
        setAppointments(apps);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (form.department) {
      setFilteredOfficers(officers.filter(o => o.department === form.department));
    } else {
      setFilteredOfficers([]);
    }
  }, [form.department, officers]);

  const selectedOfficer = officers.find(o => o.id === form.officerId);

  const handleBook = async () => {
    if (!isAuthenticated || !user) return;
    setSubmitting(true);
    try {
      const off = officers.find(o => o.id === form.officerId)!;
      await AppService.createAppointment({
        citizenId: user.uid,
        citizenName: user.name,
        citizenPhone: user.phone,
        citizenEmail: user.email,
        officerId: off.id,
        officerName: off.name,
        officerDesignation: off.designation,
        department: off.department,
        purpose: form.purpose,
        preferredDate: new Date(form.preferredDate),
        preferredTimeSlot: form.preferredTimeSlot as TimeSlot,
      });
      setSuccess('Appointment request submitted successfully!');
      const updated = await AppService.getAppointmentsByCitizen(user.uid);
      setAppointments(updated);
      setShowModal(false);
      setForm({ department: '', officerId: '', purpose: '', preferredDate: '', preferredTimeSlot: '' });
    } catch {} finally {
      setSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Appointments</h1>
          <p className="mt-2 text-secondary-500">Book appointments with government officers</p>
        </div>
        <button
          onClick={() => {
            if (!isAuthenticated) { setError('Please sign in first'); return; }
            setSuccess(null); setShowModal(true);
          }}
          className="btn-primary"
        >
          Book Appointment
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-700">{success}</div>
      )}

      {!isAuthenticated ? (
        <div className="card p-8 text-center">
          <CalendarDaysIcon className="h-16 w-16 mx-auto text-secondary-300 mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Sign in to Book Appointments</h2>
          <p className="text-secondary-500 mb-6">You need to sign in to book appointments with government officers.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Book Appointment
          </button>
        </div>
      ) : loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <>
          {appointments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Your Appointments</h2>
              <div className="grid grid-cols-1 gap-4">
                {appointments.map(app => (
                  <div key={app.id} className="card hover:shadow-lg transition-shadow">
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-secondary-900">{app.purpose}</h3>
                          <p className="text-sm text-secondary-500 mt-1">
                            with {app.officerName} ({app.officerDesignation})
                          </p>
                        </div>
                        <Badge status={app.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-secondary-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="h-4 w-4" />
                          {new Date(app.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ClockIcon className="h-4 w-4" />
                          {app.preferredTimeSlot}
                        </span>
                        <span className="text-secondary-400">{app.department}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-secondary-900">Available Officers</h2>
            </div>
            <div className="card-body">
              {officers.length === 0 ? (
                <EmptyState
                  icon={<CalendarDaysIcon className="h-12 w-12" />}
                  title="No officers available"
                  description="Check back later for available officers."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {officers.map(o => (
                    <div
                      key={o.id}
                      className="p-4 rounded-xl border border-secondary-200 bg-white hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => { setSuccess(null); setShowModal(true); setForm(prev => ({ ...prev, department: o.department, officerId: o.id })); }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-secondary-900">{o.name}</h3>
                          <p className="text-sm text-secondary-500">{o.designation}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Available</span>
                      </div>
                      <p className="text-xs text-secondary-400 mb-2">{o.department}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {o.availableSlots.slice(0, 4).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-[11px] font-medium">{s}</span>
                        ))}
                        {o.availableSlots.length > 4 && (
                          <span className="px-2 py-0.5 bg-secondary-100 text-secondary-500 rounded text-[11px]">+{o.availableSlots.length - 4}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book Appointment" size="lg">
        {!isAuthenticated ? (
          <div className="text-center py-6">
            <p className="text-secondary-600 mb-4">Please sign in to book an appointment.</p>
            <a href="/login" className="btn-primary">Sign In</a>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Department</label>
              <select value={form.department} onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value, officerId: '' }))} className="input">
                <option value="">Select department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {filteredOfficers.length > 0 && (
              <div>
                <label className="label">Officer</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {filteredOfficers.map(o => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, officerId: o.id }))}
                      className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                        form.officerId === o.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-secondary-900">{o.name}</p>
                      <p className="text-secondary-500 text-xs">{o.designation}</p>
                      {o.availableSlots.length > 0 && (
                        <p className="text-[11px] text-green-600 mt-1">
                          Available: {o.availableSlots.join(', ')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedOfficer && (
              <>
                <div>
                  <label className="label">Purpose</label>
                  <input type="text" value={form.purpose} onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))} className="input" placeholder="Brief purpose of your visit" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Preferred Date</label>
                    <input type="date" value={form.preferredDate} onChange={(e) => setForm(prev => ({ ...prev, preferredDate: e.target.value }))} min={minDate} className="input" />
                  </div>
                  <div>
                    <label className="label">Preferred Time</label>
                    <select value={form.preferredTimeSlot} onChange={(e) => setForm(prev => ({ ...prev, preferredTimeSlot: e.target.value }))} className="input">
                      <option value="">Select time</option>
                      {selectedOfficer.availableSlots.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={handleBook}
                disabled={submitting || !form.officerId || !form.purpose || !form.preferredDate || !form.preferredTimeSlot}
                className="btn-primary"
              >
                {submitting ? 'Booking...' : 'Request Appointment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}