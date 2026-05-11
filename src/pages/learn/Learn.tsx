import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../provider/LanguageProvider';

export function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const modules = [
    { id: 'm1', level: '1' },
    { id: 'm2', level: '2' },
    { id: 'm3', level: '3' },
    { id: 'm4', level: '4' },
    { id: 'm5', level: '5' },
    { id: 'm6', level: '6' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          {t('learn.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          {t('learn.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <div key={mod.id} className="glass-card overflow-hidden group hover:border-slate-300 dark:hover:border-[#262626] transition-all duration-200">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-medium tracking-widest uppercase">
                  {t('learn.level')} {mod.level}
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 group-hover:scale-150 transition-transform duration-200" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
                {t(`learn.modules.${mod.id}.title`)}
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {t(`learn.modules.${mod.id}.desc`)}
              </p>

              <button 
                onClick={() => navigate(`/learn/${mod.id}`)}
                className="btn-primary w-full"
              >
                {t('learn.startCourse')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900 dark:bg-[#0d0d0d] rounded-xl p-6 border border-slate-800 dark:border-[#1a1a1a]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-xs font-medium uppercase tracking-widest text-slate-400">Expert Quote</h4>
          </div>
          <p className="text-lg italic font-medium leading-relaxed text-slate-200 dark:text-slate-300">
            "{t('learn.quote')}"
          </p>
          <p className="mt-3 text-slate-400 font-medium text-sm">{t('learn.quoteAuthor')}</p>
        </div>
      </div>
    </div>
  );
}