import { useState, useEffect } from 'react';
import AppService from '../services/appService';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import { Announcement } from '../types';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AppService.getAnnouncements();
        setAnnouncements(data);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all' ? announcements : announcements.filter(a => a.type === filter);
  const types = ['all', ...new Set(announcements.map(a => a.type))];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Public Announcements</h1>
        <p className="mt-2 text-secondary-500">Official announcements, notices, and updates from the District Collectorate</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === t ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
            }`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<MegaphoneIcon className="h-12 w-12" />} title="No announcements" description="No announcements have been published yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(selected?.id === a.id ? null : a)}
              className="card cursor-pointer transition-all"
            >
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <Badge status={a.type} size="sm" />
                  <Badge status={a.priority} size="sm" />
                  {a.priority === 'critical' && (
                    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-1">{a.title}</h3>
                <p className={`text-sm text-secondary-600 ${selected?.id === a.id ? '' : 'line-clamp-2'}`}>{a.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-secondary-400">
                  <span>{new Date(a.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>by {a.publishedByName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}