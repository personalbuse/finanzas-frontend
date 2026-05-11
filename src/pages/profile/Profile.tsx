import { useStore } from '../../store/useStore';
import { useTranslation } from '../../provider/LanguageProvider';
import { useTheme } from '../../provider/ThemeProvider';
import { useAuth } from '../../provider/AuthProvider';
import { LogOut } from 'lucide-react';

export function Profile() {
  const { user } = useStore();
  const { t } = useTranslation();
  const { darkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6 sm:mb-10">{t('profile.title')}</h1>

      <div className="space-y-5 sm:space-y-6">
        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-5 mb-4 sm:mb-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl sm:text-2xl font-medium font-display">
              {currentUser.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{currentUser.username}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-[#1a1a1a]">
            <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a]/50 rounded-lg">
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('profile.memberSince')}</p>
              <p className="text-slate-900 dark:text-white font-semibold mt-1">
                {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('dashboard.balance')}</p>
              <p className="text-slate-900 dark:text-white font-semibold mt-1">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentUser.current_balance || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight mb-4">{t('profile.settings')}</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#1a1a1a]/50 border border-slate-100 dark:border-[#262626] group hover:border-slate-200 dark:hover:border-[#333] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t('profile.notifications')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('profile.notificationsDesc')}</p>
                </div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all cursor-pointer" />
              </div>
            </div>

            <div 
              onClick={toggleTheme}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#1a1a1a]/50 border border-slate-100 dark:border-[#262626] group hover:border-slate-200 dark:hover:border-[#333] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center transition-colors">
                  {darkMode ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t('profile.darkMode')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('profile.darkModeDesc')}</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#262626] text-xs font-medium text-slate-600 dark:text-slate-300">
                {darkMode ? t('nav.lightMode') : t('nav.darkMode')}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#1a1a1a]/50 border border-slate-100 dark:border-[#262626] group hover:border-slate-200 dark:hover:border-[#333] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t('profile.privacy')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('profile.privacyDesc')}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 uppercase tracking-widest transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-2">{t('profile.tips')}</p>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium leading-relaxed">
                {t('profile.tip')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}