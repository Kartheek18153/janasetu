import { TimelineEvent, GrievanceStatus } from '../../types';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, DocumentTextIcon, UserCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const statusIcons: Record<GrievanceStatus, typeof CheckCircleIcon> = {
  submitted: DocumentTextIcon,
  under_review: ClockIcon,
  assigned: UserCircleIcon,
  in_progress: ArrowPathIcon,
  pending_citizen: ExclamationCircleIcon,
  resolved: CheckCircleIcon,
  closed: CheckCircleIcon,
  rejected: XCircleIcon,
};

const statusColors: Record<GrievanceStatus, string> = {
  submitted: 'border-blue-500 bg-blue-100 text-blue-600',
  under_review: 'border-yellow-500 bg-yellow-100 text-yellow-600',
  assigned: 'border-indigo-500 bg-indigo-100 text-indigo-600',
  in_progress: 'border-purple-500 bg-purple-100 text-purple-600',
  pending_citizen: 'border-orange-500 bg-orange-100 text-orange-600',
  resolved: 'border-green-500 bg-green-100 text-green-600',
  closed: 'border-gray-500 bg-gray-100 text-gray-600',
  rejected: 'border-red-500 bg-red-100 text-red-600',
};

interface StatusTimelineProps {
  events: TimelineEvent[];
}

export default function StatusTimeline({ events }: StatusTimelineProps) {
  const visibleEvents = events.filter(e => e.isVisibleToCitizen);

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {visibleEvents.map((event, idx) => {
          const Icon = statusIcons[event.status] || DocumentTextIcon;
          const isLast = idx === visibleEvents.length - 1;
          const formattedDate = new Date(event.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          });

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-secondary-200" aria-hidden="true" />
                )}
                <div className="relative flex gap-x-4">
                  <div className={`relative flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 ${statusColors[event.status]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-auto py-1">
                    <div className="flex items-baseline justify-between gap-x-4">
                      <p className="text-sm font-semibold text-secondary-900">
                        {event.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-secondary-500 shrink-0">{formattedDate}</p>
                    </div>
                    <p className="mt-1 text-sm text-secondary-600">{event.description}</p>
                    <p className="mt-0.5 text-xs text-secondary-400">by {event.updatedByName}</p>
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