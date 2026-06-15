import { useTranslation } from '../../provider/LanguageProvider';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  
  return (
    <footer className="mt-20 pb-12 pt-8 border-t border-slate-200 dark:border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('app.title')}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('footer.description')}</p>
          </div>
          <div className="md:text-center">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{t('footer.university')}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('footer.department')}</p>
          </div>
          <div className="md:text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500">© {year} {t('app.title')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}