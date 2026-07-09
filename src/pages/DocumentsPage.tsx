import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { uploadLocalDocument, getLocalUserDocuments, deleteLocalDocument } from '../services/localDocService';
import {
  ArrowUpTrayIcon, TrashIcon, EyeIcon, DocumentTextIcon,
  IdentificationIcon, CreditCardIcon, GlobeAltIcon, AcademicCapIcon,
  CurrencyRupeeIcon, ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface LocalDoc {
  id: string;
  userId: string;
  docType: string;
  fileName: string;
  dataUrl: string;
  uploadedAt: number;
}

const docMeta: Record<string, { label: string; icon: typeof DocumentTextIcon; color: string; desc: string }> = {
  aadhaar:         { label: 'documents.types.aadhaar',         icon: IdentificationIcon,       color: '#FF9933', desc: '12-digit unique identity' },
  pan:             { label: 'documents.types.pan',             icon: CreditCardIcon,           color: '#1a237e', desc: 'Permanent Account Number' },
  voterId:         { label: 'documents.types.voterId',         icon: DocumentTextIcon,         color: '#138808', desc: 'Voter identification card' },
  drivingLicense:  { label: 'documents.types.drivingLicense',  icon: CreditCardIcon,           color: '#1a237e', desc: 'Driving license document' },
  passport:        { label: 'documents.types.passport',        icon: GlobeAltIcon,             color: '#475569', desc: 'International travel document' },
  birthCertificate:{ label: 'documents.types.birthCertificate',icon: DocumentTextIcon,         color: '#138808', desc: 'Certificate of birth' },
  academic:        { label: 'documents.types.academic',        icon: AcademicCapIcon,          color: '#1a237e', desc: 'Educational certificates' },
  income:          { label: 'documents.types.income',          icon: CurrencyRupeeIcon,        color: '#ea580c', desc: 'Income proof documents' },
  caste:           { label: 'documents.types.caste',           icon: ClipboardDocumentListIcon,color: '#138808', desc: 'Caste certificate' },
  rationCard:      { label: 'documents.types.rationCard',      icon: CreditCardIcon,           color: '#15803d', desc: 'Food security card' },
  other:           { label: 'documents.types.other',           icon: DocumentTextIcon,         color: '#64748b', desc: 'Other official documents' },
};

const documentTypes = Object.entries(docMeta).map(([key, meta]) => ({
  key, label: meta.label, icon: meta.icon, color: meta.color, desc: meta.desc,
}));

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [docs, setDocs] = useState<LocalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) loadDocs();
    else setLoading(false);
  }, [user]);

  const loadDocs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getLocalUserDocuments(user.uid);
      setDocs(items);
    } catch {
      setError('Failed to load documents');
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
        setError('File size must be under 5MB');
        return;
      }
      setUploading(docType);
      setError('');
      try {
        await uploadLocalDocument(user.uid, docType, file);
        await loadDocs();
      } catch {
        setError('Upload failed');
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const handleDelete = async (doc: LocalDoc) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteLocalDocument(doc.id);
      await loadDocs();
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <div className="auto-reveal-children">

      <div className="bg-gradient-to-b from-secondary-800 to-secondary-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/[0.03] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative flex items-center gap-6">
          <div className="hidden sm:block w-14 h-14 flex-shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">
            <DocumentTextIcon className="h-7 w-7 text-white/70" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('documents.title')}</h1>
            <p className="mt-1.5 text-secondary-400 text-sm">{t('documents.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!user && (
          <div className="mb-6 p-5 bg-amber-50/80 border border-amber-200 rounded-xl text-sm text-amber-700 text-center">
            Please sign in to upload and manage your documents.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-secondary-100 border-t-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {documentTypes.map((dt) => {
              const doc = getDocForType(dt.key);
              const isUploading = uploading === dt.key;
              const Icon = dt.icon;

              return (
                <div
                  key={dt.key}
                  className="bg-white border border-secondary-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-secondary-300 transition-all duration-300"
                >
                  <div className="h-1" style={{ backgroundColor: dt.color }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: dt.color + '12' }}
                        >
                          <Icon className="h-5 w-5" style={{ color: dt.color }} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-secondary-900">{t(dt.label)}</h3>
                          <p className={`text-xs mt-0.5 ${doc ? 'text-emerald-600 font-medium' : 'text-secondary-400'}`}>
                            {doc ? 'Uploaded' : dt.desc}
                          </p>
                        </div>
                      </div>
                      {doc && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 shrink-0" />
                      )}
                    </div>

                    {doc && (
                      <p className="text-xs text-secondary-400 mb-4 flex items-center gap-1.5">
                        <span className="inline-block w-1 h-1 rounded-full bg-secondary-300" />
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' \u2022 '}
                        {doc.fileName}
                      </p>
                    )}

                    <div className="flex gap-2.5">
                      {doc ? (
                        <>
                          <a
                            href={doc.dataUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-secondary-50 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 transition-all"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpload(dt.key)}
                          disabled={isUploading || !user}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: dt.color }}
                        >
                          {isUploading ? (
                            <>
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                              Upload
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-secondary-400 mt-8">
          Documents are stored locally in your browser using IndexedDB. No external storage costs.
        </p>
      </div>

    </div>
  );
}
