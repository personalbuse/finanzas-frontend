import { useState } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';

export function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al solicitar recuperación');
      }

      setMessage(data.message);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('forgotPassword.title')}
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
            {message}
          </div>
        )}

        {!message && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                {t('form.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-clean mt-1"
                placeholder={t('form.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? t('forgotPassword.loading') : t('forgotPassword.button')}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {t('forgotPassword.rememberPassword')}{' '}
            <button
              onClick={() => window.location.href = '/login'}
              className="font-bold text-slate-900 hover:underline transition-all"
            >
              {t('forgotPassword.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}