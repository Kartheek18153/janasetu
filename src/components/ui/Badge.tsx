import { GrievanceStatus, AppointmentStatus, AnnouncementPriority } from '../../types';

const statusStyles: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-purple-100 text-purple-800',
  pending_citizen: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',

  requested: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  rescheduled: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-indigo-100 text-indigo-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',

  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
  critical: 'bg-red-100 text-red-800',

  general: 'bg-gray-100 text-gray-800',
  scheme: 'bg-green-100 text-green-800',
  holiday: 'bg-blue-100 text-blue-800',
  emergency: 'bg-red-100 text-red-800',
  notice: 'bg-yellow-100 text-yellow-800',
  circular: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending_citizen: 'Pending Citizen',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',

  requested: 'Requested',
  confirmed: 'Confirmed',
  rescheduled: 'Rescheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',

  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
  critical: 'Critical',

  general: 'General',
  scheme: 'Scheme',
  holiday: 'Holiday',
  emergency: 'Emergency',
  notice: 'Notice',
  circular: 'Circular',
};

export default function Badge({
  status,
  size = 'sm',
  className = '',
}: {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'} ${sizeStyles[size]} ${className}`}
    >
      {statusLabels[status] || status}
    </span>
  );
}