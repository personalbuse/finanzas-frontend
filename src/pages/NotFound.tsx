import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../provider/LanguageProvider';

export function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-white dark:bg-black">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-slate-200 dark:text-[#1a1a1a] tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-4">
          {t('notFound.title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
          {t('notFound.description')}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          {t('notFound.goHome')}
        </button>
      </div>
    </div>
  );
}
