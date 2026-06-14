import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';
import { useTranslation } from '../../provider/LanguageProvider';
import { get2FAStatus, setup2FA, verify2FA, disable2FA } from '../../services/api';

type SetupStep = 'idle' | 'qr' | 'backup-codes' | 'enabled';

export function TwoFA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<SetupStep>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupConfirm, setBackupConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    get2FAStatus()
      .then((status) => setStep(status.enabled ? 'enabled' : 'idle'))
      .catch(() => setStep('idle'));
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await setup2FA();
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setStep('qr');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length < 6) {
      setError(t('twofa.codeRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await verify2FA(verifyCode);
      setBackupCodes(data.backup_codes);
      setStep('backup-codes');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('twofa.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = () => {
    setStep('enabled');
    setSuccessMsg(t('twofa.enabledSuccess'));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDisable = async () => {
    if (!disablePassword || disableCode.length < 6) {
      setError(t('twofa.disableRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await disable2FA(disablePassword, disableCode);
      setStep('idle');
      setShowDisable(false);
      setDisablePassword('');
      setDisableCode('');
      setSuccessMsg(t('twofa.disabledSuccess'));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-[60vh] py-8 px-4 animate-fade-in">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {t('twofa.title')}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('twofa.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
            {successMsg}
          </div>
        )}

        <div className="bg-white dark:bg-[#0d0d0d] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-[#1a1a1a]">
          {step === 'idle' && (
            <div className="text-center space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                {t('twofa.notEnabled')}
              </p>
              <button onClick={handleSetup} disabled={loading} className="btn-primary">
                {loading ? t('common.loading') : t('twofa.enableButton')}
              </button>
            </div>
          )}

          {step === 'qr' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-300 mb-4">{t('twofa.scanQr')}</p>
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="TOTP QR Code"
                  className="mx-auto rounded-lg border border-slate-200 dark:border-[#1a1a1a]"
                  style={{ width: 200, height: 200 }}
                />
                <p className="mt-3 text-xs text-slate-400">
                  {t('twofa.orManual')}: <code className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded">{secret}</code>
                </p>
              </div>

              <div>
                <label htmlFor="verify-code" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  {t('twofa.enterCode')}
                </label>
                <input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  className="input-clean mt-1 text-center text-2xl tracking-[0.5em]"
                  placeholder="______"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                  aria-label={t('twofa.enterCode')}
                />
              </div>

              <button onClick={handleVerify} disabled={loading} className="btn-primary w-full">
                {loading ? t('common.loading') : t('twofa.verifyAndEnable')}
              </button>
            </div>
          )}

          {step === 'backup-codes' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {t('twofa.saveBackupWarning')}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm space-y-1">
                {backupCodes.map((code, i) => (
                  <div key={i} className="text-slate-700 dark:text-slate-300">
                    {i + 1}. {code}
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={backupConfirm}
                  onChange={(e) => setBackupConfirm(e.target.checked)}
                  className="mt-0.5"
                />
                {t('twofa.confirmSaved')}
              </label>

              <button
                onClick={finishSetup}
                disabled={!backupConfirm}
                className="btn-primary w-full disabled:opacity-50"
              >
                {t('twofa.finishSetup')}
              </button>
            </div>
          )}

          {step === 'enabled' && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                  {t('twofa.active')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {t('twofa.activeDescription')}
                </p>
              </div>

              {user?.rol === 'admin' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                  {t('twofa.adminRequired')}
                </div>
              )}

              {!showDisable ? (
                <button
                  onClick={() => setShowDisable(true)}
                  className="btn-secondary w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('twofa.disableButton')}
                </button>
              ) : (
                <div className="space-y-4 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {t('twofa.disableWarning')}
                  </p>
                  <div>
                    <label htmlFor="disable-password" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      {t('form.password')}
                    </label>
                    <input
                      id="disable-password"
                      type="password"
                      className="input-clean mt-1"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      aria-label={t('form.password')}
                    />
                  </div>
                  <div>
                    <label htmlFor="disable-code" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      {t('twofa.enterCode')}
                    </label>
                    <input
                      id="disable-code"
                      type="text"
                      inputMode="numeric"
                      className="input-clean mt-1 text-center text-xl tracking-[0.5em]"
                      placeholder="______"
                      maxLength={6}
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      aria-label={t('twofa.enterCode')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowDisable(false); setError(''); }}
                      className="btn-secondary flex-1"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleDisable}
                      disabled={loading}
                      className="btn-primary flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700"
                    >
                      {loading ? t('common.loading') : t('twofa.confirmDisable')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
