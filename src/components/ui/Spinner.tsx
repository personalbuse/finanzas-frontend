import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullPage?: boolean;
  className?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

function SpinnerBase({
  size = 'md',
  label,
  fullPage = false,
  className = '',
}: SpinnerProps) {
  const { t } = useTranslation();
  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? t('common.loading')}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <Loader2 className={`${sizeMap[size]} animate-spin text-slate-700 dark:text-slate-200`} />
      {label ? (
        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      ) : (
        <span className="sr-only">{t('common.loading')}</span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {content}
      </div>
    );
  }
  return content;
}

export const Spinner = memo(SpinnerBase);
export default Spinner;
