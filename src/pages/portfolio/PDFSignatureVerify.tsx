import { useState, useRef, useCallback } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import api from '../../services/api';
import { Upload, FileText, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';

interface VerifyResult {
  valid: boolean;
  message: string;
  details: {
    hash: string;
    cert_serial: string;
    cert_subject: string;
    signature_timestamp: string;
  } | null;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function PDFSignatureVerify() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg(t('signature.invalidFormat'));
      setFile(null);
      return;
    }
    setFile(f);
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleVerify = async () => {
    if (!file) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/portfolio/report/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      setStatus(response.data.valid ? 'success' : 'error');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || t('common.error');
      setErrorMsg(detail);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('signature.title')}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          {t('signature.description')}
        </p>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white dark:bg-[#0d0d0d]'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            {t('signature.dragDrop')}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
            {t('signature.orClick')}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
            aria-label={t('signature.upload')}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label={t('common.remove')}
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {status === 'idle' && (
            <button
              onClick={handleVerify}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
            >
              {t('signature.verify')}
            </button>
          )}

          {status === 'loading' && (
            <div className="flex items-center justify-center py-4">
              <Spinner />
              <span className="ml-3 text-slate-500 dark:text-slate-400">
                {t('common.loading')}
              </span>
            </div>
          )}

          {status === 'success' && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-800 dark:text-emerald-200 font-medium text-sm">
                  {result.message}
                </p>
              </div>

              {result.details && (
                <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-4 space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block mb-1">
                      {t('signature.hash')}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 break-all">
                      {result.details.hash}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block mb-1">
                      {t('signature.serial')}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 break-all">
                      {result.details.cert_serial}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block mb-1">
                      {t('signature.issuer')}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 break-all">
                      {result.details.cert_subject}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block mb-1">
                      {t('signature.timestamp')}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatTimestamp(result.details.signature_timestamp)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {t('signature.verifyAnother')}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  {result && !result.valid ? (
                    <>
                      <p className="text-red-800 dark:text-red-200 font-medium text-sm">
                        {result.message}
                      </p>
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                        {t('signature.tampered')}
                      </p>
                    </>
                  ) : (
                    <p className="text-red-800 dark:text-red-200 font-medium text-sm">
                      {errorMsg || t('common.error')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
