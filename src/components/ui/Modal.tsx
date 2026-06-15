import { useEffect, useCallback, memo, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../provider/LanguageProvider';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  titleId?: string;
}

function ModalBase({ open, onClose, title, children, maxWidth = 'max-w-lg', titleId }: ModalProps) {
  const { t } = useTranslation();
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const id = titleId || 'modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div
        className={`bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl w-full ${maxWidth} mx-4 max-h-[80vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#1a1a1a]">
          <h3 id={id} className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] text-slate-400" aria-label={t('common.close')}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Modal = memo(ModalBase);
export default Modal;
