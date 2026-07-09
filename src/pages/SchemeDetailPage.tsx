import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Scheme } from '../types';
import { SchemeService, ExternalSchemeService } from '../services';
import type { BudgetScheme } from '../services/externalSchemeService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import {
  ArrowLeftIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon,
  DocumentTextIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SchemeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [externalScheme, setExternalScheme] = useState<BudgetScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/schemes'); return; }
    (async () => {
      const found = SchemeService.getSchemeById(id);
      if (found) {
        setScheme(found);
      } else {
        const ext = await ExternalSchemeService.getBudgetSchemeById(id);
        if (ext) setExternalScheme(ext);
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  const handleApply = async () => {
    if (!isAuthenticated || !user) {
      navigate(`/login?redirect=${encodeURIComponent(`/schemes/${id}`)}`);
      return;
    }
    if (!scheme) return;
    setApplying(true);
    try {
      await SchemeService.applyForScheme(user.uid, scheme.id, scheme.name);
      navigate(`/my-applications`);
    } catch {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!scheme && !externalScheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <InformationCircleIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-secondary-900 mb-2">
          {t('schemes.notFound')}
        </h2>
        <p className="text-secondary-500 text-sm mb-6">
          {t('schemes.notFoundDesc')}
        </p>
        <Link to="/schemes" className="btn-primary btn">
          {t('schemes.backToSchemes')}
        </Link>
      </div>
    );
  }

  if (externalScheme) {
    const formatCurrency = (val: number) =>
      '₹' + (val / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + 'K Cr';

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative auto-reveal-children">
        <div className="absolute -right-8 top-20 w-40 h-32 opacity-[0.05] pointer-events-none hidden lg:block">
          <img src="/images (2).jpg" alt="" className="w-full h-full object-cover rounded-xl" />
        </div>
        <button onClick={() => navigate(-1)} className="btn-ghost btn text-sm mb-6 gap-1.5">
          <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
        </button>

        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-secondary-900">{externalScheme.name}</h1>
                <p className="text-sm text-secondary-500 mt-1">{externalScheme.ministryName}</p>
              </div>
              <a href={externalScheme.officialUrl}
                target="_blank" rel="noopener noreferrer"
                className="btn-outline btn text-sm gap-2 shrink-0">
                <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Official Portal
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-lg font-bold text-secondary-900 mb-3">About This Scheme</h2>
                <p className="text-sm text-secondary-600 leading-relaxed">{externalScheme.humanContext}</p>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-base font-bold text-secondary-900 mb-3">Budget Allocation</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">FY 2025-26</p>
                    <p className="text-2xl font-bold font-serif text-citizen-green">{formatCurrency(externalScheme.allocation)}</p>
                  </div>
                  <div className="border-t border-secondary-100 pt-3">
                    <p className="text-xs text-secondary-500 mb-1">FY 2024-25</p>
                    <p className="text-lg font-semibold text-secondary-600">{formatCurrency(externalScheme.previousYear)}</p>
                  </div>
                  <div className="border-t border-secondary-100 pt-3">
                    <p className="text-xs text-secondary-500 mb-1">Year-on-Year Change</p>
                    <p className={`text-lg font-semibold ${externalScheme.yoyChange >= 0 ? 'text-citizen-green' : 'text-citizen-red'}`}>
                      {externalScheme.yoyChange >= 0 ? '+' : ''}{externalScheme.yoyChange}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-secondary-400">
                Data from Union Budget 2025-26 &middot;
                Last updated: {(() => {
                  const d = ExternalSchemeService.getLastUpdated();
                  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'today';
                })()}
              </p>
            </div>
            <Link to="/schemes" className="btn-outline btn w-full text-sm gap-2">
              Browse All Schemes <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const scopeLabel = scheme.scope === 'central'
    ? t('schemes.scope.central')
    : t('schemes.scope.state');

  const scopeColor = scheme.scope === 'central'
    ? 'bg-primary-100 text-primary-700'
    : 'bg-citizen-blue/10 text-citizen-blue';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative auto-reveal-children">
      <div className="absolute -right-8 top-20 w-40 h-32 opacity-[0.05] pointer-events-none hidden lg:block">
        <img src="/images (2).jpg" alt="" className="w-full h-full object-cover rounded-xl" />
      </div>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/schemes')}
        className="btn-ghost btn text-sm mb-6 gap-1.5"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {t('common.back')}
      </button>

      {/* Header Section */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <span className="text-5xl flex-shrink-0">{scheme.icon}</span>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-secondary-900">
                  {scheme.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-sm text-secondary-500">{scheme.ministry}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${scopeColor}`}>
                    {scopeLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-bold text-secondary-900 mb-3">
                {t('schemes.detail.description')}
              </h2>
              <p className="text-sm text-secondary-600 leading-relaxed">
                {scheme.description}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-bold text-secondary-900 mb-3">
                {t('schemes.detail.benefits')}
              </h2>
              <p className="text-sm text-secondary-600 leading-relaxed">
                {scheme.benefits}
              </p>
            </div>
          </div>

          {/* How to Apply */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-bold text-secondary-900 mb-3">
                {t('schemes.detail.howToApply')}
              </h2>
              <p className="text-sm text-secondary-600 leading-relaxed">
                {scheme.howToApply}
              </p>
            </div>
          </div>

          {/* Tags */}
          {scheme.tags.length > 0 && (
            <div className="card">
              <div className="card-body">
                <h2 className="text-lg font-bold text-secondary-900 mb-3">
                  {t('schemes.detail.tags')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {scheme.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary-100 text-secondary-600 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Eligibility Criteria */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-base font-bold text-secondary-900 mb-3">
                {t('schemes.detail.eligibility')}
              </h2>
              <ul className="space-y-2">
                {scheme.eligibility.minAge !== undefined && (
                  <li className="flex items-start gap-2 text-sm text-secondary-600">
                    <CheckCircleIcon className="w-4 h-4 text-citizen-teal mt-0.5 shrink-0" />
                    <span>{t('schemes.eligibility.minAge', { age: String(scheme.eligibility.minAge) })}</span>
                  </li>
                )}
                {scheme.eligibility.maxAge !== undefined && (
                  <li className="flex items-start gap-2 text-sm text-secondary-600">
                    <CheckCircleIcon className="w-4 h-4 text-citizen-teal mt-0.5 shrink-0" />
                    <span>{t('schemes.eligibility.maxAge', { age: String(scheme.eligibility.maxAge) })}</span>
                  </li>
                )}
                {scheme.eligibility.maxAnnualIncome !== undefined && (
                  <li className="flex items-start gap-2 text-sm text-secondary-600">
                    <CheckCircleIcon className="w-4 h-4 text-citizen-teal mt-0.5 shrink-0" />
                    <span>{t('schemes.eligibility.maxIncome', { income: scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN') })}</span>
                  </li>
                )}
                {scheme.eligibility.categories && scheme.eligibility.categories.length > 0 && (
                  <li className="flex items-start gap-2 text-sm text-secondary-600">
                    <CheckCircleIcon className="w-4 h-4 text-citizen-teal mt-0.5 shrink-0" />
                    <span>{t('schemes.eligibility.categories')}: {scheme.eligibility.categories.join(', ').toUpperCase()}</span>
                  </li>
                )}
                {scheme.eligibility.occupation && (
                  <li className="flex items-start gap-2 text-sm text-secondary-600">
                    <CheckCircleIcon className="w-4 h-4 text-citizen-teal mt-0.5 shrink-0" />
                    <span>{t('schemes.eligibility.occupation')}: {scheme.eligibility.occupation}</span>
                  </li>
                )}
                {scheme.eligibility.gender && (
                  <li className="flex items-start gap-2 text-sm text-secondary-600">
                    <CheckCircleIcon className="w-4 h-4 text-citizen-teal mt-0.5 shrink-0" />
                    <span>{t('schemes.eligibility.gender')}: {scheme.eligibility.gender}</span>
                  </li>
                )}
                {scheme.eligibility.other && (
                  <li className="flex items-start gap-2 text-sm text-secondary-600">
                    <CheckCircleIcon className="w-4 h-4 text-citizen-teal mt-0.5 shrink-0" />
                    <span>{scheme.eligibility.other}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Required Documents */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-base font-bold text-secondary-900 mb-3">
                {t('schemes.detail.documents')}
              </h2>
              <ul className="space-y-2">
                {scheme.documents.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-secondary-600">
                    <DocumentTextIcon className="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-body space-y-3">
              <a
                href={scheme.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn w-full text-sm gap-2"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                {t('schemes.detail.officialLink')}
              </a>
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="btn-primary btn w-full text-sm"
              >
                {applying ? t('schemes.applying') : t('schemes.detail.apply')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
