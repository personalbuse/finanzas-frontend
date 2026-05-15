import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';
import { useTranslation } from '../../provider/LanguageProvider';
import { useStore } from '../../store/useStore';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

export function Register() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const store = useStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

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

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          initial_balance: 10000.00,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorDetail = data.detail;
        if (Array.isArray(errorDetail)) {
          errorDetail = errorDetail.map((e: any) => e.msg).join(', ');
        }
        throw new Error(errorDetail || t('register.error'));
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email: formData.email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorDetail = data.detail;
        if (Array.isArray(errorDetail)) {
          errorDetail = errorDetail.map((e: any) => e.msg).join(', ');
        }
        throw new Error(errorDetail || t('register.error'));
      }

      const userData = data.user;
      store.login(userData, data.access_token);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      login(userData, data.access_token);
      toast.success(t('register.success') || '¡Cuenta creada exitosamente!');
      localStorage.setItem('guided_tour', 'true');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al reenviar código');
      }

      toast.success('Nuevo código enviado a tu correo');
    } catch (err: any) {
      setError(err.message || 'Error al reenviar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 animate-fade-in">
      <div className="max-w-md w-full space-y-5 bg-white dark:bg-[#0d0d0d] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-[#1a1a1a]">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {step === 1 ? t('register.title') : t('register.verifyTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {step === 1 ? t('register.subtitle') : t('register.verifySubtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmitStep1}>
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
              <label htmlFor="email" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
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
              <label htmlFor="password" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
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
                <div className="mt-2 space-y-1 bg-slate-50 dark:bg-[#1a1a1a] p-2.5 rounded-lg">
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    {t('form.passwordRequirements') || 'La contraseña debe tener:'}
                  </p>
                  <div className={`flex items-center gap-2 text-xs ${passwordRequirements.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordRequirements.length ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Mínimo 12 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordRequirements.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordRequirements.uppercase ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Una mayúscula (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordRequirements.lowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordRequirements.lowercase ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Una minúscula (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordRequirements.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordRequirements.number ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Un número (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordRequirements.symbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {passwordRequirements.symbol ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Un símbolo (@$!%*?&)</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
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
              className={`btn-primary w-full mt-2 flex items-center justify-center gap-2 ${(!allRequirementsMet || formData.password !== formData.confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('register.loading') : t('register.button')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyCode}>
            <div className="text-center mb-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Te enviamos un código de verificación a<br />
                <span className="font-medium text-slate-900 dark:text-white">{formData.email}</span>
              </p>
            </div>

            <div>
              <label htmlFor="verificationCode" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Código de verificación
              </label>
              <input
                id="verificationCode"
                type="text"
                maxLength={6}
                required
                className="input-clean mt-1 text-center text-xl tracking-widest font-mono"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                Ingresa los 6 dígitos que te enviamos por correo
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className={`btn-primary w-full mt-2 flex items-center justify-center gap-2 ${verificationCode.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('register.verifying') : t('register.verifyButton')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                {t('register.resendCode') || '¿No recibiste el código? Solicitar otro'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {step === 1 ? (
              <>
                {t('register.hasAccount')}{' '}
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="font-medium text-slate-900 dark:text-white hover:underline transition-all"
                >
                  {t('register.login')}
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setStep(1); setError(''); }}
                className="font-medium text-slate-900 dark:text-white hover:underline transition-all"
              >
                ← Volver al registro
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
