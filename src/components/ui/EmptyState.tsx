import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
        {icon ?? <Inbox className="w-7 h-7" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
