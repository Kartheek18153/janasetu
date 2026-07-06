import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchemeApplication, ApplicationStatus } from '../types';
import AppService from '../services/appService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_STYLES: Record<ApplicationStatus, { bg: string; text: string; dot: string; icon: typeof ClockIcon }> = {
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', icon: DocumentTextIcon },
  under_review: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: ClockIcon },
  approved: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', icon: CheckCircleIcon },
  disbursed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CurrencyRupeeIcon },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: XCircleIcon },
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {t(`schemes.status.${status}`)}
    </span>
  );
}

function ApplicationTimeline({ timeline }: { timeline: SchemeApplication['timeline'] }) {
  const { t } = useTranslation();
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((event, idx) => {
          const style = STATUS_STYLES[event.status as ApplicationStatus] || STATUS_STYLES.submitted;
          const isLast = idx === timeline.length - 1;
          const Icon = style.icon;
          const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          });

          return (
            <li key={idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-secondary-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex gap-x-4">
                  <div
                    className={`relative flex h-10 w-10 flex-none items-center justify-center rounded-full ${style.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${style.text}`} />
                  </div>
                  <div className="flex-auto py-1">
                    <div className="flex items-baseline justify-between gap-x-4">
                      <p className={`text-sm font-semibold ${style.text}`}>
                        {t(`schemes.status.${event.status}`)}
                      </p>
                      <p className="text-xs text-secondary-500 shrink-0">{formattedDate}</p>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-secondary-600">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function MyApplicationsPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<SchemeApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login?redirect=/my-applications');
      return;
    }

    const fetchApps = async () => {
      try {
        const apps = await AppService.getUserSchemeApplications(user.uid);
        setApplications(apps);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-secondary-900">
          {t('schemes.myApplications.title')}
        </h1>
        <p className="mt-1 text-secondary-500 text-sm">
          {t('schemes.myApplications.subtitle')}
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<ClipboardDocumentListIcon className="w-12 h-12" />}
          title={t('schemes.myApplications.empty')}
          description={t('schemes.myApplications.emptyDesc')}
          action={
            <button
              type="button"
              onClick={() => navigate('/schemes')}
              className="btn-primary btn"
            >
              {t('schemes.myApplications.browse')}
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {applications.map(app => {
            const formattedDate = new Date(app.submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            });

            return (
              <div key={app.id} className="card">
                <div className="card-body">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2
                        className="text-base font-bold text-secondary-900 cursor-pointer hover:text-primary-600"
                        onClick={() => navigate(`/schemes/${app.schemeId}`)}
                      >
                        {app.schemeName}
                      </h2>
                      <p className="text-xs text-secondary-500 mt-0.5">
                        {t('schemes.myApplications.submittedOn')} {formattedDate}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  {/* Timeline */}
                  {app.timeline && app.timeline.length > 0 && (
                    <div className="pt-4 border-t border-secondary-100">
                      <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
                        {t('schemes.myApplications.timeline')}
                      </p>
                      <ApplicationTimeline timeline={app.timeline} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
