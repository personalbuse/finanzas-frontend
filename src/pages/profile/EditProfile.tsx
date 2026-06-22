import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../provider/LanguageProvider';
import { editProfileSchema } from '../../utils/validation';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import api, { createCancelSource } from '../../services/api';

export function EditProfile() {
  const { user, setAuth } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [login2faMethod, setLogin2faMethod] = useState(user?.login_2fa_method || 'authenticator');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: Record<string, unknown> = {};
    if (username !== user?.username) payload.username = username;
    if (email !== user?.email) payload.email = email;
    if (currentPassword) payload.current_password = currentPassword;
    if (newPassword) payload.new_password = newPassword;

    const phoneClean = phoneNumber.startsWith('+57') ? phoneNumber : `+57${phoneNumber.replace(/\D/g, '')}`;
    if (phoneClean !== (user?.phone_number || '')) {
      if (phoneClean !== '+57' && !/^(\+57(3\d{9})|\+1\d{10})$/.test(phoneClean)) {
        setErrors({ phone: t('validation.phoneInvalid') });
        return;
      }
      payload.phone_number = phoneClean;
    }

    const methodChanged = login2faMethod !== (user?.login_2fa_method || 'authenticator');
    if (methodChanged) {
      payload.login_2fa_method = login2faMethod;
    }

    if (Object.keys(payload).length === 0) {
      navigate('/profile');
      return;
    }

    const parsed = editProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    const source = createCancelSource();
    try {
      const res = await api.patch('/profile', payload, { signal: source.signal });
      setAuth(res.data);
      toast.success(t('profile.profileUpdated'));
      navigate('/profile');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (detail) {
        toast.error(detail);
      } else {
        toast.error(t('toast.error'));
      }
    } finally {
      setSaving(false);
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val.startsWith('+57')) {
      setPhoneNumber(`+57${val.replace(/\D/g, '')}`);
    } else {
      const digits = val.slice(3).replace(/\D/g, '');
      setPhoneNumber(`+57${digits.slice(0, 10)}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 sm:mb-10">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          aria-label={t('profile.cancel')}
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          {t('profile.editProfile')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-6 space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('profile.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              aria-invalid={errors.username ? 'true' : 'false'}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('profile.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('profile.phone')}
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              aria-invalid={errors.phone ? 'true' : 'false'}
              placeholder="+17622493759"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="login2faMethod" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('profile.loginMethod')}
            </label>
            <select
              id="login2faMethod"
              value={login2faMethod}
              onChange={(e) => setLogin2faMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
            >
              <option value="authenticator">{t('profile.authenticator')}</option>
              <option value="sms">{t('profile.sms')}</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-6 space-y-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('profile.leaveBlankIfUnchanged')}
          </p>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('profile.currentPassword')}
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              aria-invalid={errors.current_password ? 'true' : 'false'}
            />
            {errors.current_password && (
              <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('profile.newPassword')}
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              aria-invalid={errors.new_password ? 'true' : 'false'}
            />
            {errors.new_password && (
              <p className="text-xs text-red-500 mt-1">{errors.new_password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            {t('profile.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '...' : t('profile.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
}
