import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Algo salió mal',
  message,
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4 text-red-500">
        <AlertCircle className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        {message}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default ErrorState;
