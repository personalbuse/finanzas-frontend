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
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('login.title')}</h2>
          <p className="mt-3 text-slate-500 font-medium">{t('login.subtitle')}</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
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
            <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {t('form.password')}
            </label>
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
        
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {t('login.noAccount')}{' '}
            <button 
              onClick={() => window.location.href = '/register'}
              className="font-bold text-slate-900 hover:underline transition-all"
            >
              {t('login.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
