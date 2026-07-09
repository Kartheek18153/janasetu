import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import TrackGrievance from '../components/forms/TrackGrievance';
import Badge from '../components/ui/Badge';
import { Grievance } from '../types';

export default function TrackGrievancePage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [myGrievances, setMyGrievances] = useState<Grievance[]>([]);
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const q = query(collection(db, 'grievances'), where('citizenId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Grievance));
      setMyGrievances(all);
    });
    return unsub;
  }, [isAuthenticated, user]);

  const filteredGrievances = useMemo(() => {
    if (!filterParam || filterParam === 'all') return myGrievances;
    if (filterParam === 'resolved') return myGrievances.filter(g => g.status === 'resolved' || g.status === 'closed');
    if (filterParam === 'pending') return myGrievances.filter(g => g.status === 'submitted' || g.status === 'under_review');
    return myGrievances;
  }, [myGrievances, filterParam]);

  const sectionTitle =
    filterParam === 'resolved' ? t('track.resolvedSection') :
    filterParam === 'pending' ? t('track.pendingSection') :
    t('track.myGrievances');

  return (
    <div className="auto-reveal-children">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{t('track.title')}</h1>
        <p className="mt-2 text-secondary-500">{t('track.subtitle')}</p>
      </div>

      <TrackGrievance initialTrackingId={selectedTrackingId} />

      {filteredGrievances.length > 0 && !selectedTrackingId && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-secondary-900 mb-4">{sectionTitle}</h2>
          <div className="space-y-3">
            {filteredGrievances.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedTrackingId(g.trackingId)}
                className="card card-body block w-full text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-secondary-900 truncate">{g.title}</h3>
                      <Badge status={g.priority} size="sm" />
                    </div>
                    <p className="text-xs text-secondary-500 font-mono">{g.trackingId}</p>
                    <p className="text-sm text-secondary-600 line-clamp-1 mt-1">{g.description}</p>
                  </div>
                  <Badge status={g.status} size="md" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}