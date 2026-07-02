import { useSearchParams } from 'react-router-dom';
import TrackGrievance from '../components/forms/TrackGrievance';

export default function TrackGrievancePage() {
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('trackingId');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Track Grievance</h1>
        <p className="mt-2 text-secondary-500">Enter your tracking ID to check the current status of your complaint</p>
      </div>
      <TrackGrievance initialTrackingId={trackingId || undefined} />
    </div>
  );
}