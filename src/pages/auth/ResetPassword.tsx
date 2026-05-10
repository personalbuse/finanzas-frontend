import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    if (!token) {
      setError('Token inválido o faltante');
    }
  }, [token]);

  const checkPassword = (value: string) => {
    setPasswordRequirements({
      length: value.length >= 12,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      symbol: /[@$!%*?&]/.test(value),
    });
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!token) {
      setError('Token inválido');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!allRequirementsMet) {
      setError('La contraseña no cumple con los requisitos');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token, new_password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al restablecer contraseña');
      }

      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#0d0d0d] p-8 rounded-xl border border-red-200 dark:border-red-900">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Token Inválido</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">El enlace de recuperación no es válido o ha expirado.</p>
            <button
              onClick={() => window.location.href = '/forgot-password'}
              className="mt-4 btn-primary"
            >
              Solicitar nuevo enlace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#0d0d0d] p-8 rounded-xl border border-slate-200 dark:border-[#1a1a1a]">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
            {message}
            <p className="text-xs mt-1 opacity-70">Serás redirigido al login en 3 segundos...</p>
          </div>
        )}

        {!message && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Nueva Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-clean mt-1"
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPassword(e.target.value);
                }}
              />
              {password && (
                <div className="mt-2 space-y-1 bg-slate-50 dark:bg-[#1a1a1a] p-2.5 rounded-lg">
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    La contraseña debe tener:
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
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-clean mt-1"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !allRequirementsMet || password !== confirmPassword}
              className={`btn-primary w-full mt-2 ${(!allRequirementsMet || password !== confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Procesando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <button
              onClick={() => window.location.href = '/login'}
              className="font-medium text-slate-900 dark:text-white hover:underline transition-all"
            >
              Volver al Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}