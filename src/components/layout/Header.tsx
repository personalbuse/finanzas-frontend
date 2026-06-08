import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../provider/LanguageProvider';
import { useAuth } from '../../provider/AuthProvider';
import { useTheme } from '../../provider/ThemeProvider';
import { LogOut } from 'lucide-react';

export function Header() {
  const { language, changeLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard') },
    { path: '/markets', label: t('nav.markets') },
    { path: '/indices', label: t('nav.indices') },
    { path: '/stocks', label: t('nav.stocks') },
    { path: '/forex', label: t('nav.forex') },
    { path: '/leaderboard', label: 'Ranking' },
    { path: '/portfolio', label: t('nav.portfolio') },
    { path: '/learn', label: t('nav.learn') },
    { path: '/transactions', label: t('nav.transactions') },
    { path: '/profile', label: t('nav.profile') },
    ...(user?.rol === 'admin' ? [{ path: '/admin', label: t('nav.admin') }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-[#1a1a1a] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <div 
            className="cursor-pointer group" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-baseline">
              <span className="font-display text-2xl font-light tracking-[0.3em] text-slate-900 dark:text-white uppercase">
                Simulador
              </span>
              <span className="ml-3 font-display text-sm font-light tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase hidden sm:block">
                Stock Market
              </span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors"
              aria-label={darkMode ? t('nav.lightMode') : t('nav.darkMode')}
            >
              {darkMode ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => changeLanguage(language === 'en' ? 'es' : 'en')}
              className="px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] rounded-lg hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors uppercase tracking-widest"
            >
              {language === 'en' ? 'ES' : 'EN'}
            </button>
            
            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              aria-label={t('nav.logout')}
            >
              <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <nav className="lg:hidden flex items-center space-x-1 pb-3 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
               className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                isActive(item.path)
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
