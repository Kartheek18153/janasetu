import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { storage } from '../firebase/config';
import { uploadDocument, getUserDocuments, deleteDocument } from '../services/storageService';
import {
  ArrowUpTrayIcon, DocumentIcon, TrashIcon, EyeIcon,
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
    </svg>
  );
}

interface DocItem {
  id: string;
  userId: string;
  docType: string;
  fileName: string;
  url: string;
  uploadedAt: any;
}

const docGradients: Record<string, string> = {
  aadhaar: 'from-[#FF9933] to-[#ea580c]',
  pan: 'from-[#1a237e] to-[#283593]',
  voterId: 'from-[#138808] to-[#15803d]',
  drivingLicense: 'from-[#1a237e] to-[#3949ab]',
  passport: 'from-[#1a237e] to-[#5c6bc0]',
  birthCertificate: 'from-[#138808] to-[#16a34a]',
  academic: 'from-[#1a237e] to-[#3f51b5]',
  income: 'from-[#FF9933] to-[#f97316]',
  caste: 'from-[#138808] to-[#22c55e]',
  rationCard: 'from-[#138808] to-[#4ade80]',
  other: 'from-[#1a237e] to-[#64748b]',
};

const docIcons: Record<string, string> = {
  aadhaar: '🆔',
  pan: '💳',
  voterId: '🗳️',
  drivingLicense: '🚗',
  passport: '🛂',
  birthCertificate: '👶',
  academic: '🎓',
  income: '💰',
  caste: '📋',
  rationCard: '🪪',
  other: '📄',
};

const documentTypes = Object.keys(docGradients).map(key => ({
  key,
  label: `documents.types.${key}` as const,
  icon: docIcons[key],
}));

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const storageAvailable = !!storage;

  useEffect(() => {
    if (user && storageAvailable) {
      loadDocuments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getUserDocuments(user.uid);
      setDocs(items as DocItem[]);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getDocForType = (docType: string) => docs.find(d => d.docType === docType);

  const handleUpload = async (docType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0] as File | undefined;
      if (!file || !user) return;

      if (file.size > 5 * 1024 * 1024) {
        setError(t('documents.sizeError'));
        return;
      }

      setUploading(docType);
      setError('');
      try {
        await uploadDocument(user.uid, docType, file);
        await loadDocuments();
      } catch (err: any) {
        setError(err.message || t('common.error'));
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const handleDelete = async (doc: DocItem) => {
    if (!user) return;
    if (!window.confirm(t('documents.deleteConfirm'))) return;

    try {
      await deleteDocument(doc.id, `documents/${user.uid}/${doc.docType}/${doc.fileName}`);
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    }
  };

  if (!storageAvailable) {
    return (
      <div className="relative">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-5 right-10 opacity-[0.06]">
              <AshokaChakra className="w-32 h-32 text-white" />
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative flex items-center gap-6 justify-center">
            <div className="hidden sm:block w-32 h-24 flex-shrink-0 overflow-hidden rounded-xl opacity-80">
              <img src="/document-shield.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('documents.title')}</h1>
              <p className="mt-2 text-primary-100/80 text-sm">{t('documents.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            {t('documents.storageNotConfigured')}
          </div>
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
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative flex items-center gap-6 justify-center">
          <div className="hidden sm:block w-32 h-24 flex-shrink-0 overflow-hidden rounded-xl opacity-80">
            <img src="/document-shield.svg" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('documents.title')}</h1>
            <p className="mt-2 text-primary-100/80 text-sm">{t('documents.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="absolute -right-8 top-12 w-48 h-36 opacity-[0.06] pointer-events-none hidden lg:block">
          <img src="/feature-documents.jpg" alt="" className="w-full h-full object-cover rounded-xl" />
        </div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((dt) => {
            const doc = getDocForType(dt.key);
            const isUploading = uploading === dt.key;
            const gradient = docGradients[dt.key] || 'from-secondary-500 to-secondary-600';

            return (
              <div key={dt.key} className="card hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className={`h-12 bg-gradient-to-r ${gradient} flex items-center px-4 relative`}>
                  <div className="absolute inset-0 opacity-[0.06]">
                    <AshokaChakra className="w-full h-full text-white" />
                  </div>
                  <div className="relative flex items-center gap-2">
                    <span className="text-xl">{dt.icon}</span>
                    <h3 className="text-sm font-bold text-white truncate">{t(dt.label)}</h3>
                  </div>
                  <div className="ml-auto relative">
                    <span className={`inline-block w-2 h-2 rounded-full ${doc ? 'bg-green-400' : 'bg-white/40'}`} />
                  </div>
                </div>
                <div className="card-body">
                  <p className={`text-xs font-medium mb-3 ${doc ? 'text-emerald-600' : 'text-secondary-400'}`}>
                    {doc ? t('documents.uploaded') : t('documents.notUploaded')}
                  </p>

                  {doc && (
                    <p className="text-xs text-secondary-400 mb-3">
                      {t('documents.uploadedOn')}: {new Date(doc.uploadedAt?.toDate?.() || doc.uploadedAt).toLocaleDateString('en-IN')}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {doc ? (
                      <>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          {t('documents.view')}
                        </a>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                          {t('documents.delete')}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUpload(dt.key)}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <ArrowUpTrayIcon className="h-4 w-4" />
                        )}
                        {isUploading ? t('documents.uploading') : t('documents.upload')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
