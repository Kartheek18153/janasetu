import { useState, useEffect } from 'react';
import AppService from '../../services/appService';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { Announcement, AnnouncementType, AnnouncementPriority } from '../../types';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

const defaultForm = {
  title: '', content: '', type: 'general' as AnnouncementType,
  priority: 'medium' as AnnouncementPriority,
  targetAudience: 'all' as 'all' | 'citizens' | 'officers' | 'specific_department',
  department: '',
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [submitting, setSubmitting] = useState(false);

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

  const handlePublish = async () => {
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: form.title,
        content: form.content,
        type: form.type,
        priority: form.priority,
        publishedBy: 'admin-1',
        publishedByName: 'Admin Officer',
        publishedAt: new Date(),
        isActive: true,
        targetAudience: form.targetAudience,
        department: form.department || undefined,
        attachments: [],
      };
      setAnnouncements(prev => [newAnn, ...prev]);
      setShowModal(false);
      setForm({ ...defaultForm });
    } catch {} finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Announcements</h1>
          <p className="text-secondary-500 mt-1">Publish and manage public announcements</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">New Announcement</button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : announcements.length === 0 ? (
        <EmptyState icon={<MegaphoneIcon className="h-12 w-12" />} title="No announcements" description="Publish your first announcement." />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-secondary-900">{a.title}</h3>
                      <Badge status={a.type} size="sm" />
                      <Badge status={a.priority} size="sm" />
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">{a.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-secondary-400">
                      <span>Published: {new Date(a.publishedAt).toLocaleDateString('en-IN')}</span>
                      <span>by {a.publishedByName}</span>
                      <span>Audience: {a.targetAudience}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Announcement" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} className="input" placeholder="Announcement title" />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea value={form.content} onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))} className="input resize-y" rows={5} placeholder="Announcement content..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as AnnouncementType }))} className="input">
                <option value="general">General</option>
                <option value="scheme">Scheme</option>
                <option value="holiday">Holiday</option>
                <option value="emergency">Emergency</option>
                <option value="notice">Notice</option>
                <option value="circular">Circular</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as AnnouncementPriority }))} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Target Audience</label>
              <select value={form.targetAudience} onChange={(e) => setForm(prev => ({ ...prev, targetAudience: e.target.value as any }))} className="input">
                <option value="all">All</option>
                <option value="citizens">Citizens Only</option>
                <option value="officers">Officers Only</option>
                <option value="specific_department">Specific Department</option>
              </select>
            </div>
            {form.targetAudience === 'specific_department' && (
              <div>
                <label className="label">Department</label>
                <input type="text" value={form.department} onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))} className="input" placeholder="Department name" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handlePublish} disabled={submitting || !form.title || !form.content} className="btn-primary">
              {submitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}