import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppService from '../../services/appService';


const categories = [
  { value: 'water_supply', label: 'Water Supply', icon: 'Water' },
  { value: 'electricity', label: 'Electricity', icon: 'Power' },
  { value: 'roads', label: 'Roads & Infrastructure', icon: 'Road' },
  { value: 'sanitation', label: 'Sanitation', icon: 'Waste' },
  { value: 'healthcare', label: 'Healthcare', icon: 'Health' },
  { value: 'education', label: 'Education', icon: 'School' },
  { value: 'revenue', label: 'Revenue/Land Records', icon: 'Revenue' },
  { value: 'public_distribution', label: 'Public Distribution', icon: 'Supply' },
  { value: 'social_welfare', label: 'Social Welfare', icon: 'Welfare' },
  { value: 'other', label: 'Other', icon: 'Other' },
];

const departments = [
  'Water Supply & Sanitation', 'Electricity Board', 'Public Works Department',
  'Health Department', 'Revenue Department', 'Education Department',
  'Social Welfare Department', 'Other',
];

const priorities = [
  { value: 'low', label: 'Low', desc: 'Non-urgent, can be scheduled' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention soon' },
  { value: 'high', label: 'High', desc: 'Requires prompt action' },
  { value: 'urgent', label: 'Urgent', desc: 'Immediate attention needed' },
];

interface GrievanceFormProps {
  onSuccess: (trackingId: string) => void;
}

export default function GrievanceForm({ onSuccess }: GrievanceFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: '', department: '', priority: '',
    location: { address: '', landmark: '', city: '', wardNo: '', district: '', state: '', pincode: '' },
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const touchFields = (...fields: string[]) => {
    setTouched(prev => {
      const next = { ...prev };
      fields.forEach(f => (next[f] = true));
      return next;
    });
  };

  const canProceed = (s: number) => {
    if (s === 1) return form.category && form.department && form.priority;
    if (s === 2) return form.title.trim().length >= 5 && form.description.trim().length >= 10 && form.location.address.trim().length >= 5 && form.location.city.trim().length >= 2 && form.location.district.trim().length >= 2 && form.location.state.trim().length >= 2 && form.location.pincode.trim().length === 6;
    return true;
  };

  const handleNext = (s: number) => {
    if (s === 1) touchFields('category', 'department', 'priority');
    if (s === 2) touchFields('title', 'description', 'address', 'city', 'district', 'state', 'pincode');
    if (!canProceed(s)) return;
    setStep(s + 1);
  };

  const handleSubmit = async () => {
    touchFields('title', 'description', 'address', 'city', 'district', 'state', 'pincode', 'category', 'department', 'priority');
    if (!isAuthenticated || !user) {
      setError('Please sign in to file a grievance');
      return;
    }
    if (!user.uid || !user.name || !user.email) {
      setError('User profile is incomplete. Please update your profile.');
      return;
    }
    if (!form.location.address.trim() || !form.location.city.trim() || !form.location.district.trim() || !form.location.state.trim() || form.location.pincode.trim().length !== 6) {
      setError('Please provide complete address details (address, city, district, state) with a valid 6-digit pincode.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await AppService.createGrievance({
        citizenId: user.uid,
        citizenName: user.name,
        citizenPhone: user.phone || '',
        citizenEmail: user.email,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        department: form.department,
        location: form.location,
      });
      onSuccess(result.trackingId);
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all duration-300 ${
              step >= s
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-secondary-200 text-secondary-500'
            }`}>
              {step > s ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </div>
            <span className={`ml-2.5 text-sm font-medium transition-colors ${
              step >= s ? 'text-primary-700' : 'text-secondary-400'
            }`}>
              {s === 1 ? 'Category & Priority' : s === 2 ? 'Details' : 'Review & Submit'}
            </span>
            {s < 3 && (
              <div className={`w-16 h-0.5 mx-3 rounded-full transition-colors duration-300 ${step > s ? 'bg-primary-500' : 'bg-secondary-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Please sign in to file a grievance.
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="label text-base">Select Category</label>
            <p className="text-xs text-secondary-400 mb-3">Choose the category that best describes your issue</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { updateField('category', cat.value); touchFields('category'); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                    form.category === cat.value
                      ? 'border-primary-500 bg-primary-50 shadow-primary-100'
                      : 'border-secondary-200 hover:border-secondary-300 bg-white'
                  } ${touched.category && !form.category ? 'border-red-300' : ''}`}
                >
                  <p className="text-sm font-semibold text-secondary-900">{cat.label}</p>
                </button>
              ))}
            </div>
            {touched.category && !form.category && <p className="text-xs text-red-500 mt-1">Please select a category</p>}
          </div>

          <div>
            <label className="label text-base">Department</label>
            <select
              value={form.department}
              onChange={(e) => { updateField('department', e.target.value); touchFields('department'); }}
              className={`input ${touched.department && !form.department ? 'border-red-300' : ''}`}
            >
              <option value="">Select department</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {touched.department && !form.department && <p className="text-xs text-red-500 mt-1">Please select a department</p>}
          </div>

          <div>
            <label className="label text-base">Priority Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorities.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { updateField('priority', p.value); touchFields('priority'); }}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 active:scale-[0.98] ${
                    form.priority === p.value
                      ? 'border-primary-500 bg-primary-50 shadow-primary-100'
                      : 'border-secondary-200 hover:border-secondary-300 bg-white'
                  } ${touched.priority && !form.priority ? 'border-red-300' : ''}`}
                >
                  <p className="text-sm font-semibold text-secondary-900 capitalize">{p.label}</p>
                  <p className="text-[11px] text-secondary-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
            {touched.priority && !form.priority && <p className="text-xs text-red-500 mt-1">Please select a priority level</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => handleNext(1)} className="btn-primary px-6">
              Next: Details
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="label text-base">Title</label>
            <p className="text-xs text-secondary-400 mb-2">Brief title of your complaint</p>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { updateField('title', e.target.value); touchFields('title'); }}
              placeholder="e.g. Streetlight not working in Sector 12"
              className={`input ${touched.title && form.title.trim().length < 5 ? 'border-red-300' : ''}`}
            />
            {touched.title && form.title.trim().length < 5 && <p className="text-xs text-red-500 mt-1">Minimum 5 characters required</p>}
          </div>

          <div>
            <label className="label text-base">Description</label>
            <p className="text-xs text-secondary-400 mb-2">Describe your issue in detail</p>
            <textarea
              value={form.description}
              onChange={(e) => { updateField('description', e.target.value); touchFields('description'); }}
              placeholder="Describe the problem, location, and any relevant details..."
              rows={5}
              className={`input resize-y ${touched.description && form.description.trim().length < 10 ? 'border-red-300' : ''}`}
            />
            {touched.description && form.description.trim().length < 10 && <p className="text-xs text-red-500 mt-1">Minimum 10 characters required</p>}
          </div>

          <div>
            <label className="label text-base">Location Details</label>
            <p className="text-xs text-secondary-400 mb-2">Provide the complete address of the issue location</p>
            <div className="space-y-3">
              <div>
                <textarea
                  value={form.location.address}
                  onChange={(e) => { setForm(prev => ({ ...prev, location: { ...prev.location, address: e.target.value } })); touchFields('address'); }}
                  placeholder="Full address / street name"
                  rows={2}
                  className={`input ${touched.address && form.location.address.trim().length < 5 ? 'border-red-300' : ''}`}
                />
                {touched.address && form.location.address.trim().length < 5 && <p className="text-xs text-red-500 mt-1">Address must be at least 5 characters</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.location.landmark}
                  onChange={(e) => setForm(prev => ({ ...prev, location: { ...prev.location, landmark: e.target.value } }))}
                  placeholder="Nearest landmark"
                  className="input"
                />
                <div>
                  <input
                    type="text"
                    value={form.location.city}
                    onChange={(e) => { setForm(prev => ({ ...prev, location: { ...prev.location, city: e.target.value } })); touchFields('city'); }}
                    placeholder="Village / City name"
                    className={`input ${touched.city && form.location.city.trim().length < 2 ? 'border-red-300' : ''}`}
                  />
                  {touched.city && form.location.city.trim().length < 2 && <p className="text-xs text-red-500 mt-1">City name required</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.location.wardNo}
                  onChange={(e) => setForm(prev => ({ ...prev, location: { ...prev.location, wardNo: e.target.value } }))}
                  placeholder="Ward No."
                  className="input"
                />
                <div>
                  <input
                    type="text"
                    value={form.location.district}
                    onChange={(e) => { setForm(prev => ({ ...prev, location: { ...prev.location, district: e.target.value } })); touchFields('district'); }}
                    placeholder="District"
                    className={`input ${touched.district && form.location.district.trim().length < 2 ? 'border-red-300' : ''}`}
                  />
                  {touched.district && form.location.district.trim().length < 2 && <p className="text-xs text-red-500 mt-1">District required</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={form.location.state}
                    onChange={(e) => { setForm(prev => ({ ...prev, location: { ...prev.location, state: e.target.value } })); touchFields('state'); }}
                    placeholder="State"
                    className={`input ${touched.state && form.location.state.trim().length < 2 ? 'border-red-300' : ''}`}
                  />
                  {touched.state && form.location.state.trim().length < 2 && <p className="text-xs text-red-500 mt-1">State required</p>}
                </div>
                <div>
                  <input
                    type="text"
                    value={form.location.pincode}
                    onChange={(e) => { setForm(prev => ({ ...prev, location: { ...prev.location, pincode: e.target.value } })); touchFields('pincode'); }}
                    placeholder="Pincode"
                    maxLength={6}
                    className={`input ${touched.pincode && form.location.pincode.trim().length !== 6 ? 'border-red-300' : ''}`}
                  />
                  {touched.pincode && form.location.pincode.trim().length !== 6 && <p className="text-xs text-red-500 mt-1">Valid 6-digit pincode required</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary px-6">Back</button>
            <button onClick={() => handleNext(2)} className="btn-primary px-6">
              Next: Review
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-secondary-50 to-white rounded-xl border border-secondary-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-secondary-900">Review Your Grievance</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-white rounded-lg border border-secondary-100">
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">Category</p>
                <p className="font-semibold text-secondary-900 mt-1">{categories.find(c => c.value === form.category)?.label}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-secondary-100">
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">Department</p>
                <p className="font-semibold text-secondary-900 mt-1">{form.department}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-secondary-100">
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">Priority</p>
                <p className="font-semibold text-secondary-900 mt-1 capitalize">{form.priority}</p>
              </div>
              {form.location.address && (
                <div className="p-3 bg-white rounded-lg border border-secondary-100 col-span-2">
                  <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">Location</p>
                  <p className="font-semibold text-secondary-900 mt-1">{form.location.address}</p>
                  <div className="text-xs text-secondary-500 mt-1 space-y-0.5">
                    {form.location.landmark && <p>Landmark: {form.location.landmark}</p>}
                    <p>{[form.location.city, form.location.district, form.location.state].filter(Boolean).join(', ')} - {form.location.pincode}</p>
                    {form.location.wardNo && <p>Ward No: {form.location.wardNo}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-secondary-200">
              <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide mb-1">Title</p>
              <p className="font-semibold text-secondary-900">{form.title}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-secondary-700 leading-relaxed">{form.description}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary px-6">Back</button>
            <button onClick={handleSubmit} disabled={submitting || !isAuthenticated} className="btn-primary px-8">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : 'Submit Grievance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}