import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { GrievanceService, uploadFiles, formatFileSize, isValidFileType, isValidFileSize } from '../../services';

const categories = [
  { value: 'water_supply', labelKey: 'fileGrievance.categories.water_supply', icon: 'Water' },
  { value: 'electricity', labelKey: 'fileGrievance.categories.electricity', icon: 'Power' },
  { value: 'roads', labelKey: 'fileGrievance.categories.roads', icon: 'Road' },
  { value: 'sanitation', labelKey: 'fileGrievance.categories.sanitation', icon: 'Waste' },
  { value: 'healthcare', labelKey: 'fileGrievance.categories.healthcare', icon: 'Health' },
  { value: 'education', labelKey: 'fileGrievance.categories.education', icon: 'School' },
  { value: 'revenue', labelKey: 'fileGrievance.categories.revenue', icon: 'Revenue' },
  { value: 'public_distribution', labelKey: 'fileGrievance.categories.public_distribution', icon: 'Supply' },
  { value: 'social_welfare', labelKey: 'fileGrievance.categories.social_welfare', icon: 'Welfare' },
  { value: 'other', labelKey: 'fileGrievance.categories.other', icon: 'Other' },
];

const departments = [
  'Water Supply & Sanitation', 'Electricity Board', 'Public Works Department',
  'Health Department', 'Revenue Department', 'Education Department',
  'Social Welfare Department', 'Other',
];

const priorities = [
  { value: 'low', labelKey: 'badge.priority.low', descKey: 'Non-urgent, can be scheduled' },
  { value: 'medium', labelKey: 'badge.priority.medium', descKey: 'Needs attention soon' },
  { value: 'high', labelKey: 'badge.priority.high', descKey: 'Requires prompt action' },
  { value: 'urgent', labelKey: 'badge.priority.urgent', descKey: 'Immediate attention needed' },
];

interface GrievanceFormProps {
  onSuccess: (trackingId: string) => void;
}

export default function GrievanceForm({ onSuccess }: GrievanceFormProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: '', department: '', priority: '',
    location: { address: '', landmark: '', city: '', wardNo: '', district: '', state: '', pincode: '' },
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (!isValidFileType(f, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])) {
        setError(`${f.name}: Invalid file type. Only JPG, PNG, WebP, PDF allowed.`);
        return false;
      }
      if (!isValidFileSize(f, 10)) {
        setError(`${f.name}: File size exceeds 10MB limit.`);
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      setError(t('fileGrievance.auth.required'));
      return;
    }
    if (!user.uid || !user.name || !user.email) {
      setError(t('common.error'));
      return;
    }
    if (!form.location.address.trim() || !form.location.city.trim() || !form.location.district.trim() || !form.location.state.trim() || form.location.pincode.trim().length !== 6) {
      setError(t('common.error'));
      return;
    }
    setSubmitting(true);
    setError('');
    setUploadProgress(0);
    try {
      // Upload attachments if any
      let uploadedAttachments: { name: string; url: string; type: string; size: number }[] = [];
      if (attachments.length > 0) {
        const results = await uploadFiles(attachments, user.uid, { folder: 'grievances' });
        uploadedAttachments = results.map(r => ({ name: r.name, url: r.url, type: r.type, size: r.size }));
      }
      setUploadProgress(100);

      const result = await GrievanceService.createGrievance({
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
        attachments: uploadedAttachments,
      });
      onSuccess(result.trackingId);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
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
              {s === 1 ? t('fileGrievance.form.category') : s === 2 ? 'Details' : 'Review & Submit'}
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
                  <p className="text-sm font-semibold text-secondary-900">{t(cat.labelKey)}</p>
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
                  <p className="text-sm font-semibold text-secondary-900 capitalize">{t(p.labelKey)}</p>
                  <p className="text-[11px] text-secondary-400 mt-0.5">{p.descKey}</p>
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

          {/* Attachments */}
          <div>
            <label className="label text-base">Attachments (Optional)</label>
            <p className="text-xs text-secondary-400 mb-2">Add photos or documents (max 10MB each, JPG/PNG/WebP/PDF)</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              onChange={handleFileSelect}
              disabled={submitting}
              className="input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-secondary-900 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-secondary-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-secondary-400 hover:text-red-500 transition-colors"
                      disabled={submitting}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">{t('fileGrievance.form.category')}</p>
                <p className="font-semibold text-secondary-900 mt-1">{t(categories.find(c => c.value === form.category)?.labelKey || '') || form.category}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-secondary-100">
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">{t('appointments.form.department')}</p>
                <p className="font-semibold text-secondary-900 mt-1">{form.department}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-secondary-100">
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">Priority</p>
                <p className="font-semibold text-secondary-900 mt-1 capitalize">{form.priority}</p>
              </div>
              {form.location.address && (
                <div className="p-3 bg-white rounded-lg border border-secondary-100 col-span-2">
                  <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide">{t('fileGrievance.form.location')}</p>
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

            {attachments.length > 0 && (
              <div className="pt-3 border-t border-secondary-200">
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wide mb-1">Attachments</p>
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-secondary-100">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-secondary-700">{file.name}</span>
                      </div>
                      <span className="text-xs text-secondary-500">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary px-6">Back</button>
            <button onClick={handleSubmit} disabled={submitting || !isAuthenticated} className="btn-primary px-8">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : t('fileGrievance.form.submit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}