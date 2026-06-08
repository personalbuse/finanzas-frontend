import { useTranslation } from '../../provider/LanguageProvider';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  
  return (
    <footer className="mt-20 pb-12 pt-8 border-t border-slate-200 dark:border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose max-w-2xl mx-auto">
          {t('footer.description')}
        </p>
        <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium mt-4 tracking-tight">
          © {year} {t('app.title')}
        </p>
      </div>
    </footer>
  );
}