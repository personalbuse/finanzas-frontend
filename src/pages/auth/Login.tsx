import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';
import { useTranslation } from '../../provider/LanguageProvider';
import { useAuthStore } from '../../store/useAuthStore';
import { API_BASE_URL } from '../../services/api';
import { z } from 'zod';
import { loginSchema } from '../../utils/validation';

export function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const store = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name: string, value: string) => {
    const fieldSchema = (loginSchema.shape as Record<string, z.ZodTypeAny>)[name];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [name]: t(result.error.issues[0].message) }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = t(err.message);
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
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

      store.setAuth(userData);
      login(userData);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 animate-fade-in">
      <div className="max-w-md w-full space-y-5 bg-white dark:bg-[#0d0d0d] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-[#1a1a1a]">
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
              aria-invalid={errors.username ? 'true' : 'false'}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.username}
              </p>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {t('form.password')}
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
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
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.password}
              </p>
            )}
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
              onClick={() => navigate('/register')}
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
