import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-secondary-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">{t('common.noResults')}</h2>
        <p className="text-secondary-500 mb-6">{t('common.noResultsDescription')}</p>
        <Link to="/" className="btn-primary">{t('common.back')}</Link>
      </div>
    </div>
  );
}