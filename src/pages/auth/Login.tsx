import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';
import { useTranslation } from '../../provider/LanguageProvider';
import { useStore } from '../../store/useStore';
import { toast } from 'react-toastify';

export function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const store = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        let errorDetail = data.detail;
        if (Array.isArray(errorDetail)) {
          errorDetail = errorDetail.map(e => e.msg).join(', ');
        }
        throw new Error(errorDetail || t('login.invalidCredentials'));
      }

      const data = await response.json();
      const userData = data.user;

      store.login(userData, data.access_token);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      login(userData, data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#0d0d0d] p-8 rounded-xl border border-slate-200 dark:border-[#1a1a1a]">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{t('login.title')}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('login.subtitle')}</p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}
        
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              {t('form.username')}
            </label>
            <input
              id="username" name="username" type="text" required
              className="input-clean mt-1"
              placeholder={t('form.usernamePlaceholder')}
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {t('form.password')}
              </label>
              <button
                type="button"
                onClick={() => window.location.href = '/forgot-password'}
                className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            <input
              id="password" name="password" type="password" required
              className="input-clean mt-1"
              placeholder={t('form.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? t('login.loading') : t('login.button')}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('login.noAccount')}{' '}
            <button 
              onClick={() => window.location.href = '/register'}
              className="font-medium text-slate-900 dark:text-white hover:underline transition-all"
            >
              {t('login.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
