import { memo } from 'react';
import Modal from './Modal';
import { useTranslation } from '../../provider/LanguageProvider';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialogBase({ open, title, message, confirmLabel, cancelLabel, variant = 'danger', onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation();
  const confirmText = confirmLabel || t('common.confirm');
  const cancelText = cancelLabel || t('common.cancel');
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-3 py-2 text-sm rounded-lg text-white transition-all ${
            variant === 'danger'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

export const ConfirmDialog = memo(ConfirmDialogBase);
export default ConfirmDialog;
