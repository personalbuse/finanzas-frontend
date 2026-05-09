import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../provider/LanguageProvider';

export function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const modules = [
    { id: 'm1', level: '1' },
    { id: 'm2', level: '2' },
    { id: 'm3', level: '3' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('learn.title')}
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          {t('learn.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((mod) => (
          <div key={mod.id} className="glass-card overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-white text-[10px] font-bold tracking-widest uppercase shadow-md">
                  {t('learn.level')} {mod.level}
                </span>
                <div className="h-2 w-2 rounded-full bg-emerald-400 group-hover:scale-150 transition-transform duration-300" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                {t(`learn.modules.${mod.id}.title`)}
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {t(`learn.modules.${mod.id}.desc`)}
              </p>

              <button 
                onClick={() => navigate(`/learn/${mod.id}`)}
                className="btn-primary w-full shadow-lg hover:shadow-xl transition-shadow"
              >
                {t('learn.startCourse')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse-slow" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Expert Quote</h4>
          </div>
          <p className="text-xl md:text-2xl italic font-medium leading-relaxed text-slate-100">
            "{t('learn.quote')}"
          </p>
          <p className="mt-4 text-slate-400 font-bold text-sm">{t('learn.quoteAuthor')}</p>
        </div>
      </div>
    </div>
  );
}