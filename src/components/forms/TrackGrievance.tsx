import { useState, useEffect } from 'react';
import AppService from '../../services/appService';
import Badge from '../ui/Badge';
import StatusTimeline from '../ui/StatusTimeline';
import LoadingSpinner from '../ui/LoadingSpinner';

import { Grievance } from '../../types';

interface Props {
  initialTrackingId?: string;
}

export default function TrackGrievance({ initialTrackingId }: Props) {
  const [trackingId, setTrackingId] = useState(initialTrackingId || '');
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      searchByTrackingId(initialTrackingId);
    }
  }, [initialTrackingId]);

  const searchByTrackingId = async (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setGrievance(null);
    try {
      const result = await AppService.getGrievanceByTrackingId(trimmed);
      if (result) {
        setGrievance(result);
      } else {
        setError('No grievance found with this tracking ID');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => searchByTrackingId(trackingId);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card mb-6">
        <div className="card-body">
          <label htmlFor="tracking" className="label">Enter your Tracking ID</label>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
            <input
              id="tracking"
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              placeholder="e.g. JST-A1B2-C3D4"
              className="input font-mono"
            />
            <button type="submit" disabled={loading || !trackingId.trim()} className="btn-primary shrink-0">
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>
      </div>

      {loading && <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {grievance && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">{grievance.title}</h3>
                  <p className="text-sm text-secondary-500 mt-1">ID: {grievance.trackingId}</p>
                </div>
                <Badge status={grievance.status} size="md" />
              </div>
            </div>
            <div className="card-body space-y-4">
              <p className="text-sm text-secondary-700">{grievance.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-secondary-500">Category</p>
                  <p className="font-medium text-secondary-900 capitalize">{grievance.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Department</p>
                  <p className="font-medium text-secondary-900">{grievance.department}</p>
                </div>
                <div>
                  <p className="text-secondary-500">Priority</p>
                  <Badge status={grievance.priority} />
                </div>
                <div>
                  <p className="text-secondary-500">Filed On</p>
                  <p className="font-medium text-secondary-900">
                    {new Date(grievance.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {grievance.assignedToName && (
                <div className="p-3 bg-primary-50 rounded-lg text-sm">
                  <span className="text-primary-700 font-medium">Assigned to: </span>
                  <span className="text-primary-600">{grievance.assignedToName}</span>
                </div>
              )}

              {grievance.location?.address && (
                <div className="text-sm text-secondary-500 space-y-0.5">
                  <div><span className="font-medium">Location: </span>{grievance.location.address}</div>
                  {grievance.location.landmark && <div><span className="font-medium">Landmark: </span>{grievance.location.landmark}</div>}
                  {grievance.location.city && <div><span className="font-medium">City/Village: </span>{grievance.location.city}</div>}
                  {grievance.location.wardNo && <div><span className="font-medium">Ward No: </span>{grievance.location.wardNo}</div>}
                  {grievance.location.district && <div><span className="font-medium">District: </span>{grievance.location.district}</div>}
                  {grievance.location.state && <div><span className="font-medium">State: </span>{grievance.location.state}</div>}
                  {grievance.location.pincode && <div><span className="font-medium">Pincode: </span>{grievance.location.pincode}</div>}
                </div>
              )}

            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-secondary-900">Status Timeline</h3>
            </div>
            <div className="card-body">
              <StatusTimeline events={grievance.timeline} />
            </div>
          </div>

          {grievance.feedback && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-secondary-900">Your Feedback</h3>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-5 w-5 ${star <= grievance.feedback!.rating ? 'text-yellow-400' : 'text-secondary-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-secondary-600">{grievance.feedback.comment}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}