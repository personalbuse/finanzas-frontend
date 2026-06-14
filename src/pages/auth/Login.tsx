import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';
import { useTranslation } from '../../provider/LanguageProvider';
import { useAuthStore } from '../../store/useAuthStore';
import { API_BASE_URL, loginVerify2FA, loginBackup2FA } from '../../services/api';
import type { z } from 'zod';
import { loginSchema } from '../../utils/validation';

type LoginMode = 'credentials' | 'totp' | 'backup';

export function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const store = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<LoginMode>('credentials');
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');

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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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

      const data = await response.json();

      if (!response.ok) {
        let errorDetail = data.detail;
        if (Array.isArray(errorDetail)) {
          errorDetail = errorDetail.map(e => e.msg).join(', ');
        }
        throw new Error(errorDetail || t('login.invalidCredentials'));
      }

      if (data.requires_2fa_setup) {
        store.setAuth(data.user);
        login(data.user);
        navigate('/settings/2fa');
        return;
      }

      if (data.requires_2fa) {
        setTempToken(data.temp_token);
        setMode('totp');
        return;
      }

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

  const handleTOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (totpCode.length < 6) {
      setError(t('login.totpRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await loginVerify2FA(tempToken, totpCode);
      store.setAuth(data.user);
      login(data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('login.totpError');
      if (msg.includes('expir')) {
        setMode('credentials');
        setTempToken('');
        setError(t('login.totpExpired'));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!backupCode.trim()) {
      setError(t('login.backupRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await loginBackup2FA(tempToken, backupCode.trim());
      store.setAuth(data.user);
      login(data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('login.backupError');
      if (msg.includes('expir')) {
        setMode('credentials');
        setTempToken('');
        setError(t('login.backupExpired'));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (mode === 'credentials') validateField(name, value);
  };

  const resetToCredentials = useCallback(() => {
    setMode('credentials');
    setTempToken('');
    setTotpCode('');
    setBackupCode('');
    setError('');
  }, []);

  if (mode === 'totp') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 animate-fade-in">
        <div className="max-w-md w-full space-y-5 bg-white dark:bg-[#0d0d0d] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-[#1a1a1a]">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{t('login.totpTitle')}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('login.totpSubtitle')}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleTOTPSubmit}>
            <div>
              <label htmlFor="totp-code" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {t('login.totpLabel')}
              </label>
              <input
                id="totp-code" name="totp-code" type="text" inputMode="numeric" autoComplete="one-time-code"
                className="input-clean mt-1 text-center text-2xl tracking-[0.5em]"
                placeholder="______"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                aria-label={t('login.totpLabel')}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? t('login.verifying') : t('login.verifyButton')}
            </button>
          </form>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => setMode('backup')}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              {t('login.useBackupCode')}
            </button>
            <br />
            <button
              type="button"
              onClick={resetToCredentials}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {t('login.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'backup') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 animate-fade-in">
        <div className="max-w-md w-full space-y-5 bg-white dark:bg-[#0d0d0d] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-[#1a1a1a]">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{t('login.backupTitle')}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('login.backupSubtitle')}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleBackupSubmit}>
            <div>
              <label htmlFor="backup-code" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {t('login.backupLabel')}
              </label>
              <input
                id="backup-code" name="backup-code" type="text"
                className="input-clean mt-1 text-center"
                placeholder="XXXX-XXXX"
                maxLength={20}
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                autoFocus
                aria-label={t('login.backupLabel')}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? t('login.verifying') : t('login.verifyButton')}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode('totp')}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              {t('login.backToTotp')}
            </button>
            <br />
            <button
              type="button"
              onClick={resetToCredentials}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {t('login.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        
        <form className="mt-6 space-y-5" onSubmit={handleCredentialsSubmit}>
          <div>
            <label htmlFor="username" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              {t('form.username')}
            </label>
            <input
              id="username" name="username" type="text" required autoComplete="username"
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
              id="password" name="password" type="password" required autoComplete="current-password"
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
