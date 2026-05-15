import { useTranslation } from '../provider/LanguageProvider';
import { Wrench } from 'lucide-react';

export function Maintenance() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#1a1a1a] mb-6">
          <Wrench className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
          {t('maintenance.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('maintenance.description')}
        </p>
      </div>
    </div>
  );
}
