import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

const variantMap = {
  danger:
    'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 text-white',
  primary:
    'bg-slate-900 hover:bg-slate-800 focus-visible:ring-slate-700 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900',
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={pending || loading}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-[#1a1a1a] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending || loading}
            className={`px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${variantMap[variant]}`}
          >
            {pending || loading ? 'Procesando…' : confirmText}
          </button>
        </>
      }
    >
      <div className="text-sm">{message}</div>
    </Modal>
  );
}

export default ConfirmDialog;
