import { memo, type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function EmptyStateBase({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      {icon && <div className="mb-4 text-slate-300 dark:text-slate-600">{icon}</div>}
      <h4 className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export const EmptyState = memo(EmptyStateBase);
export default EmptyState;
