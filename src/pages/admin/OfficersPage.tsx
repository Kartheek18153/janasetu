import { useState, useEffect } from 'react';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { Officer, TimeSlot } from '../../types';
import { UsersIcon, PlusIcon } from '@heroicons/react/24/outline';

const timeSlots: TimeSlot[] = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00',
];

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', designation: '', department: '', email: '', phone: '',
    availableSlots: [] as TimeSlot[], maxAppointmentsPerDay: 10,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [offs, depts] = await Promise.all([
          AppService.getOfficers(),
          AppService.getDepartments(),
        ]);
        setOfficers(offs);
        setDepartments(depts.map(d => d.name));
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSlot = (slot: TimeSlot) => {
    setForm(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter(s => s !== slot)
        : [...prev.availableSlots, slot],
    }));
  };

  const handleAddOfficer = () => {
    const newOfficer: Officer = {
      id: 'off-' + Date.now(),
      name: form.name,
      designation: form.designation,
      department: form.department,
      email: form.email,
      phone: form.phone,
      availableSlots: form.availableSlots,
      isActive: true,
      maxAppointmentsPerDay: form.maxAppointmentsPerDay,
    };
    setOfficers(prev => [...prev, newOfficer]);
    setShowModal(false);
    setForm({ name: '', designation: '', department: '', email: '', phone: '', availableSlots: [], maxAppointmentsPerDay: 10 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Officers</h1>
          <p className="text-secondary-500 mt-1">Manage government officers and their availability</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-600 to-admin-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-admin-200/50 transition-all active:scale-[0.97]">
          <PlusIcon className="h-4 w-4" /> Add Officer
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : officers.length === 0 ? (
        <EmptyState icon={<UsersIcon className="h-12 w-12" />} title="No officers" description="Add your first officer to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {officers.map(o => (
            <div key={o.id} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-admin-500 to-admin-600 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white font-bold text-sm">{o.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{o.name}</h3>
                      <p className="text-sm text-secondary-500">{o.designation}</p>
                      <p className="text-xs text-secondary-400">{o.department}</p>
                    </div>
                  </div>
                  <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (o.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs text-secondary-500 space-y-1 mt-3 pt-3 border-t border-secondary-100">
                  <p>{o.email} | {o.phone}</p>
                  <p>Max {o.maxAppointmentsPerDay} appointments/day</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {o.availableSlots.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-admin-50 text-admin-700 rounded text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Officer" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Designation</label>
              <input type="text" value={form.designation} onChange={(e) => setForm(prev => ({ ...prev, designation: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <select value={form.department} onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))} className="input">
                <option value="">Select</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Max Appointments/Day</label>
              <input type="number" value={form.maxAppointmentsPerDay} onChange={(e) => setForm(prev => ({ ...prev, maxAppointmentsPerDay: parseInt(e.target.value) || 10 }))} className="input" min={1} max={50} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Available Time Slots</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  className={'p-2 rounded-lg text-xs font-medium border transition-all duration-200 ' + (form.availableSlots.includes(slot) ? 'bg-admin-50 border-admin-500 text-admin-700 shadow-sm' : 'bg-white border-secondary-200 text-secondary-600 hover:border-admin-300 hover:bg-admin-50/50')}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl bg-secondary-100 text-secondary-700 text-sm font-semibold hover:bg-secondary-200 transition-all">Cancel</button>
            <button onClick={handleAddOfficer} disabled={!form.name || !form.designation || !form.department} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-600 to-admin-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-admin-200/50 transition-all active:scale-[0.97] disabled:opacity-50">
              Add Officer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
