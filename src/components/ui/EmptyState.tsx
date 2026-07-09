import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

function DefaultEmptyIcon() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="40" cy="30" r="10" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M25 55c0-8.284 6.716-15 15-15s15 6.716 15 15" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="text-secondary-200 mb-4">
        {icon || <DefaultEmptyIcon />}
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-secondary-500 text-center max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}