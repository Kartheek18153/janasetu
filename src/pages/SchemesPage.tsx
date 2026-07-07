import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scheme, UserProfileForm } from '../types';
import AppService from '../services/appService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import EligibilityProfiler from '../components/schemes/EligibilityProfiler';
import {
  CheckCircleIcon, XCircleIcon, ArrowRightIcon, PencilSquareIcon, ArrowTopRightOnSquareIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';

function AshokaChakra({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <line key={angle} x1="50" y1="10" x2="50" y2="18" stroke="currentColor" strokeWidth="2"
          transform={`rotate(${angle} 50 50)`} />
      ))}
      {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
        <line key={angle} x1="50" y1="10" x2="50" y2="24" stroke="currentColor" strokeWidth="1.2"
          transform={`rotate(${angle} 50 50)`} />
      ))}
      {[7.5, 37.5, 67.5, 97.5, 127.5, 157.5, 187.5, 217.5, 247.5, 277.5, 307.5, 337.5].map((angle) => (
        <line key={angle} x1="50" y1="10" x2="50" y2="22" stroke="currentColor" strokeWidth="0.8"
          transform={`rotate(${angle} 50 50)`} />
      ))}
    </svg>
  );
}

const schemeGradients = [
  'from-[#1a237e] to-[#283593]',
  'from-[#138808] to-[#15803d]',
  'from-[#FF9933] to-[#ea580c]',
  'from-[#1a237e] to-[#3949ab]',
  'from-[#138808] to-[#16a34a]',
  'from-[#f97316] to-[#FF9933]',
  'from-[#1a237e] to-[#5c6bc0]',
  'from-[#138808] to-[#22c55e]',
];

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-citizen-green';
  if (score >= 50) return 'text-citizen-yellow';
  return 'text-citizen-red';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-citizen-green/10';
  if (score >= 50) return 'bg-citizen-yellow/10';
  return 'bg-citizen-red/10';
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score)} ${getScoreBg(score)}`}
    >
      {score}% Match
    </span>
  );
}

function EligibilitySummary({
  profile,
  onEdit,
}: {
  profile: UserProfileForm;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const rows: { label: string; value: string }[] = [
    { label: t('schemes.profiler.age.label'), value: String(profile.age) },
    { label: t('schemes.profiler.state.label'), value: profile.state },
    { label: t('schemes.profiler.income.label'), value: `₹${profile.annualIncome.toLocaleString('en-IN')}` },
    { label: t('schemes.profiler.category.label'), value: profile.category.toUpperCase() },
    { label: t('schemes.profiler.occupation.label'), value: profile.occupation },
    { label: t('schemes.profiler.gender.label'), value: profile.gender },
  ];

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary-900">
            {t('schemes.summary.title')}
          </h3>
          <button
            type="button"
            onClick={onEdit}
            className="btn-ghost btn text-sm gap-1.5"
          >
            <PencilSquareIcon className="w-4 h-4" />
            {t('schemes.summary.edit')}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rows.map(r => (
            <div key={r.label}>
              <p className="text-xs text-secondary-500 mb-0.5">{r.label}</p>
              <p className="text-sm font-semibold text-secondary-900">{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SchemeCard({
  scheme,
  score,
  matches,
  onViewDetails,
  onApply,
  idx = 0,
}: {
  scheme: Scheme;
  score: number;
  matches: string[];
  onViewDetails: () => void;
  onApply: () => void;
  idx?: number;
}) {
  const { t } = useTranslation();
  const benefitPreview =
    scheme.benefits.length > 100
      ? scheme.benefits.slice(0, 100) + '...'
      : scheme.benefits;
  const gradient = schemeGradients[idx % schemeGradients.length];

  return (
    <div className="card hover:shadow-lg transition-all overflow-hidden">
      <div className={`h-28 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        <div className="absolute inset-0 opacity-[0.08]">
          <AshokaChakra className="w-full h-full text-white" />
        </div>
        <div className="relative flex items-center gap-3 px-5">
          <span className="text-5xl drop-shadow-lg">{scheme.icon}</span>
          <div className="text-white">
            <h3 className="font-bold text-lg leading-tight">{scheme.name}</h3>
            <p className="text-white/70 text-xs mt-0.5">{scheme.ministry}</p>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <ScoreBadge score={score} />
        </div>
        {(scheme as any).scope && (
          <div className="absolute bottom-2 left-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded">
              {(scheme as any).scope === 'central' ? 'Central Govt' : 'State Govt'}
            </span>
          </div>
        )}
      </div>
      <div className="card-body">
        <p className="text-sm text-secondary-600 mb-3">{benefitPreview}</p>

        {matches.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {matches.slice(0, 3).map(m => (
              <span
                key={m}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-citizen-teal/10 text-citizen-teal text-xs rounded-full"
              >
                <CheckCircleIcon className="w-3 h-3" />
                {m}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-secondary-100">
          <button
            type="button"
            onClick={onViewDetails}
            className="btn-outline btn text-sm flex-1"
          >
            {t('schemes.viewDetails')}
          </button>
          <button
            type="button"
            onClick={onApply}
            className="btn-primary btn text-sm flex-1"
          >
            {t('schemes.applyNow')}
            <ArrowRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchemesPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileForm | null>(null);
  const [showProfiler, setShowProfiler] = useState(true);

  const results = useMemo(() => {
    if (!profile) return null;
    return AppService.matchSchemes(profile);
  }, [profile]);

  const eligibleSchemes = useMemo(
    () => (results || []).filter(r => r.score >= 50),
    [results],
  );
  const notEligibleSchemes = useMemo(
    () => (results || []).filter(r => r.score < 50),
    [results],
  );

  const handleSubmit = (form: UserProfileForm) => {
    setProfile(form);
    setShowProfiler(false);
  };

  const handleEdit = () => {
    setShowProfiler(true);
  };

  const handleApply = async (scheme: Scheme) => {
    if (!isAuthenticated || !user) {
      navigate(`/login?redirect=${encodeURIComponent('/schemes')}`);
      return;
    }
    try {
      await AppService.applyForScheme(user.uid, scheme.id, scheme.name);
      navigate('/my-applications');
    } catch {
      // stay on page
    }
  };

  if (showProfiler || !profile) {
    return (
      <div className="relative">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-5 right-10 opacity-[0.06]">
              <AshokaChakra className="w-32 h-32 text-white" />
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 pointer-events-none hidden lg:block">
            <img src="/images (3).jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {t('schemes.profiler.title')}
            </h1>
            <p className="mt-2 text-primary-100/80 text-sm max-w-xl mx-auto">
              {t('schemes.profiler.subtitle')}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EligibilityProfiler onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-5 right-10 opacity-[0.06]">
            <AshokaChakra className="w-32 h-32 text-white" />
          </div>
          <div className="absolute bottom-5 left-10 opacity-[0.04]">
            <AshokaChakra className="w-24 h-24 text-white" />
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-48 opacity-15 pointer-events-none hidden lg:block">
          <img src="/Gemini_Generated_Image_r1pkvfr1pkvfr1pk.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {t('schemes.results.title')}
          </h1>
          <p className="mt-1 text-primary-100/80 text-sm">
            {t('schemes.results.subtitle')}
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Eligibility Summary */}
      <EligibilitySummary profile={profile} onEdit={handleEdit} />

      {/* Eligible Schemes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircleIcon className="w-5 h-5 text-citizen-green" />
          <h2 className="text-lg font-bold text-secondary-900">
            {t('schemes.eligible.title')}
          </h2>
          <span className="text-sm text-secondary-400">({eligibleSchemes.length})</span>
        </div>
        {eligibleSchemes.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-8">
              <XCircleIcon className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
              <p className="text-secondary-500 text-sm">{t('schemes.eligible.none')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibleSchemes.map((r, i) => (
              <SchemeCard
                key={r.scheme.id}
                scheme={r.scheme}
                score={r.score}
                matches={r.matches}
                idx={i}
                onViewDetails={() => navigate(`/schemes/${r.scheme.id}`)}
                onApply={() => handleApply(r.scheme)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Not Eligible Schemes */}
      {notEligibleSchemes.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <XCircleIcon className="w-5 h-5 text-secondary-400" />
            <h2 className="text-lg font-bold text-secondary-900">
              {t('schemes.notEligible.title')}
            </h2>
            <span className="text-sm text-secondary-400">({notEligibleSchemes.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
            {notEligibleSchemes.map((r, i) => (
              <SchemeCard
                key={r.scheme.id}
                scheme={r.scheme}
                score={r.score}
                matches={r.matches}
                idx={i + eligibleSchemes.length}
                onViewDetails={() => navigate(`/schemes/${r.scheme.id}`)}
                onApply={() => handleApply(r.scheme)}
              />
            ))}
          </div>
        </section>
      )}

      {/* External Scheme Sources */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <GlobeAltIcon className="w-5 h-5 text-citizen-blue" />
          <h2 className="text-lg font-bold text-secondary-900">
            {t('schemes.sources.title')}
          </h2>
        </div>
        <p className="text-sm text-secondary-500 mb-4">
          {t('schemes.sources.subtitle')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="https://www.mygov.in" target="_blank" rel="noopener noreferrer" className="card hover:shadow-md transition-shadow">
            <div className="card-body flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-citizen-blue/10 flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 text-citizen-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-secondary-900">{t('schemes.sources.myGov')}</p>
              </div>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
            </div>
          </a>
          <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="card hover:shadow-md transition-shadow">
            <div className="card-body flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-citizen-green/10 flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 text-citizen-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-secondary-900">{t('schemes.sources.nationalPortal')}</p>
              </div>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
            </div>
          </a>
          <a href="https://dbtbharat.gov.in" target="_blank" rel="noopener noreferrer" className="card hover:shadow-md transition-shadow">
            <div className="card-body flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-citizen-yellow/10 flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 text-citizen-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-secondary-900">{t('schemes.sources.dbt')}</p>
              </div>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
            </div>
          </a>
          <a href="https://www.sjewelfare.gov.in" target="_blank" rel="noopener noreferrer" className="card hover:shadow-md transition-shadow">
            <div className="card-body flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-citizen-red/10 flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 text-citizen-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-secondary-900">{t('schemes.sources.scheduleCaste')}</p>
              </div>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
            </div>
          </a>
        </div>
      </section>
    </div>
    </div>
  );
}
