import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import GrievanceForm from '../components/forms/GrievanceForm';
import { CheckCircleIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function FileGrievancePage() {
  const { t } = useTranslation();
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (submittedTrackingId) {
      await navigator.clipboard.writeText(submittedTrackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="auto-reveal-children">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{t('fileGrievance.title')}</h1>
        <p className="mt-2 text-secondary-500">{t('fileGrievance.subtitle')}</p>
      </div>

      {submittedTrackingId ? (
        <div className="max-w-lg mx-auto text-center">
          <div className="card p-8">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-citizen-teal" />
            </div>
            <h2 className="text-xl font-bold text-secondary-900 mb-2">{t('fileGrievance.success')}</h2>
            <p className="text-sm text-secondary-500 mb-4">{t('fileGrievance.successDescription')}</p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-primary-600 font-medium mb-1">{t('fileGrievance.yourTrackingId')}</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-mono font-bold text-primary-700 tracking-wider">{submittedTrackingId}</p>
                <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-primary-100 transition-colors" title="Copy tracking ID">
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-citizen-teal" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5 text-primary-500" />
                  )}
                </button>
              </div>
              {copied && <p className="text-xs text-citizen-teal mt-1">{t('fileGrievance.copied')}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={`/track?trackingId=${submittedTrackingId}`} className="btn-primary">
                {t('fileGrievance.trackStatus')}
              </Link>
              <button onClick={() => setSubmittedTrackingId(null)} className="btn-secondary">
                {t('fileGrievance.fileAnother')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <GrievanceForm onSuccess={(trackingId) => setSubmittedTrackingId(trackingId)} />
      )}
    </div>
  );
}