import { useState, useEffect } from 'react';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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
      id: `off-${Date.now()}`,
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
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-1" /> Add Officer
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : officers.length === 0 ? (
        <div className="card p-12 text-center text-secondary-500">
          <UsersIcon className="h-12 w-12 mx-auto mb-3 text-secondary-300" />
          <p>No officers added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {officers.map(o => (
            <div key={o.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-secondary-900">{o.name}</h3>
                    <p className="text-sm text-secondary-500">{o.designation}</p>
                    <p className="text-xs text-secondary-400">{o.department}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${o.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="text-xs text-secondary-500 space-y-1">
                  <p>{o.email} | {o.phone}</p>
                  <p>Max {o.maxAppointmentsPerDay} appointments/day</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {o.availableSlots.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">{s}</span>
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
                  className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                    form.availableSlots.includes(slot)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAddOfficer} disabled={!form.name || !form.designation || !form.department} className="btn-primary">
              Add Officer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}