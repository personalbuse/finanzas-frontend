import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';
import { useTranslation } from '../../provider/LanguageProvider';
import { useStore } from '../../store/useStore';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle } from 'lucide-react';

export function Register() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const store = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      // Register
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          initial_balance: 10000.00,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // BUG FIX: Handle list-type detail or object-type detail from FastAPI
        let errorDetail = data.detail;
        if (Array.isArray(errorDetail)) {
          errorDetail = errorDetail.map(e => e.msg).join(', ');
        } else if (typeof errorDetail === 'object') {
          errorDetail = JSON.stringify(errorDetail);
        }
        throw new Error(errorDetail || t('register.error'));
      }

      // Login immediately after register
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!loginResponse.ok) throw new Error(t('register.loginError'));

      const loginData = await loginResponse.json();
      const userData = loginData.user;

      store.login(userData, loginData.access_token);
      localStorage.setItem('token', loginData.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      login(userData, loginData.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      setPasswordRequirements({
        length: value.length >= 12,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        symbol: /[@$!%*?&]/.test(value),
      });
    }
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('register.title')}</h2>
          <p className="mt-3 text-slate-500 font-medium">{t('register.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
            <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {t('form.email')}
            </label>
            <input
              id="email" name="email" type="email" required
              className="input-clean mt-1"
              placeholder={t('form.emailPlaceholder')}
              value={formData.email}
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
            {formData.password && (
              <div className="mt-3 space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {t('form.passwordRequirements') || 'La contraseña debe tener:'}
                </p>
                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {passwordRequirements.length ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Mínimo 12 caracteres</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.uppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {passwordRequirements.uppercase ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Una mayúscula (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.lowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {passwordRequirements.lowercase ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Una minúscula (a-z)</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.number ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {passwordRequirements.number ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Un número (0-9)</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.symbol ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {passwordRequirements.symbol ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Un símbolo (@$!%*?&)</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {t('form.confirmPassword')}
            </label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required
              className="input-clean mt-1"
              placeholder={t('form.confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !allRequirementsMet || formData.password !== formData.confirmPassword}
            className={`btn-primary w-full mt-2 ${(!allRequirementsMet || formData.password !== formData.confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? t('register.loading') : t('register.button')}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {t('register.hasAccount')}{' '}
            <button 
              onClick={() => window.location.href = '/login'}
              className="font-bold text-slate-900 hover:underline transition-all"
            >
              {t('register.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
