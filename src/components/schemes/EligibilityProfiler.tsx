import { useState } from 'react';
import { UserProfileForm, SocialCategory } from '../../types';
import { useTranslation } from '../../i18n';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const CATEGORIES: { value: SocialCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'obc', label: 'OBC' },
  { value: 'ews', label: 'EWS' },
  { value: 'other', label: 'Other' },
];

const GENDERS = ['Male', 'Female', 'Other'];

const STEPS = [
  { num: 1, key: 'step1', labelKey: 'schemes.profiler.step.age' },
  { num: 2, key: 'step2', labelKey: 'schemes.profiler.step.state' },
  { num: 3, key: 'step3', labelKey: 'schemes.profiler.step.income' },
  { num: 4, key: 'step4', labelKey: 'schemes.profiler.step.category' },
];

interface Props {
  onSubmit: (profile: UserProfileForm) => void;
}

export default function EligibilityProfiler({ onSubmit }: Props) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<UserProfileForm>({
    age: 0,
    state: '',
    annualIncome: 0,
    category: '' as SocialCategory,
    occupation: '',
    gender: '',
  });

  const update = (field: keyof UserProfileForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return form.age >= 1 && form.age <= 120;
      case 2: return form.state !== '';
      case 3: return form.annualIncome >= 0;
      case 4: return form.occupation.trim() !== '' && form.gender !== '';
      default: return false;
    }
  };

  const stepTitleKey = STEPS[currentStep - 1].labelKey;

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="card-body">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    step.num < currentStep
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : step.num === currentStep
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-secondary-300 text-secondary-400 bg-white'
                  }`}
                >
                  {step.num < currentStep ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    step.num <= currentStep ? 'text-secondary-700' : 'text-secondary-400'
                  }`}
                >
                  {t(step.labelKey)}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-16 h-0.5 mx-2 mb-5 ${
                    step.num < currentStep ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <h2 className="text-xl font-bold text-secondary-900 text-center mb-6">
          {t(stepTitleKey)}
        </h2>

        {/* Step Content */}
        {currentStep === 1 && (
          <div>
            <label className="label" htmlFor="age">
              {t('schemes.profiler.age.label')}
            </label>
            <input
              id="age"
              type="number"
              min={1}
              max={120}
              value={form.age || ''}
              onChange={e => {
                const v = parseInt(e.target.value) || 0;
                update('age', Math.min(Math.max(v, 0), 120));
              }}
              className="input"
              placeholder={t('schemes.profiler.age.placeholder')}
            />
            {form.age > 0 && (form.age < 1 || form.age > 120) && (
              <p className="text-red-500 text-xs mt-1">{t('schemes.profiler.age.invalid')}</p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <label className="label" htmlFor="state">
              {t('schemes.profiler.state.label')}
            </label>
            <select
              id="state"
              value={form.state}
              onChange={e => update('state', e.target.value)}
              className="input"
            >
              <option value="">{t('schemes.profiler.state.placeholder')}</option>
              {INDIAN_STATES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <label className="label" htmlFor="income">
              {t('schemes.profiler.income.label')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 font-medium">₹</span>
              <input
                id="income"
                type="number"
                min={0}
                value={form.annualIncome || ''}
                onChange={e => update('annualIncome', Math.max(0, parseInt(e.target.value) || 0))}
                className="input pl-8"
                placeholder={t('schemes.profiler.income.placeholder')}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="category">
                {t('schemes.profiler.category.label')}
              </label>
              <select
                id="category"
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="input"
              >
                <option value="">{t('schemes.profiler.category.placeholder')}</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="occupation">
                {t('schemes.profiler.occupation.label')}
              </label>
              <input
                id="occupation"
                type="text"
                value={form.occupation}
                onChange={e => update('occupation', e.target.value)}
                className="input"
                placeholder={t('schemes.profiler.occupation.placeholder')}
              />
            </div>

            <div>
              <label className="label" htmlFor="gender">
                {t('schemes.profiler.gender.label')}
              </label>
              <select
                id="gender"
                value={form.gender}
                onChange={e => update('gender', e.target.value)}
                className="input"
              >
                <option value="">{t('schemes.profiler.gender.placeholder')}</option>
                {GENDERS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="btn-secondary btn"
          >
            {t('common.back')}
          </button>

          <div className="text-xs text-secondary-400">
            {t('schemes.profiler.stepIndicator', { current: String(currentStep), total: String(STEPS.length) })}
          </div>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
              disabled={!canProceed()}
              className="btn-primary btn"
            >
              {t('common.next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSubmit(form)}
              disabled={!canProceed()}
              className="btn-primary btn"
            >
              {t('schemes.profiler.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
