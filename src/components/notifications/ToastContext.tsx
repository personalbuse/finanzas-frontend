import React, { createContext, useContext, useEffect, useRef } from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  loading: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastId = useRef<string | number | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info' | 'loading', message: string) => {
    const options: ToastOptions = {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    };

    switch (type) {
      case 'success':
        return toast.success(message, options);
      case 'error':
        return toast.error(message, options);
      case 'warning':
        return toast.warning(message, options);
      case 'info':
        return toast.info(message, options);
      case 'loading':
        toastId.current = toast.loading(message);
        return toastId.current;
      default:
        return toast(message, options);
    }
  };

  const success = (message: string) => showToast('success', message);
  const error = (message: string) => showToast('error', message);
  const warning = (message: string) => showToast('warning', message);
  const info = (message: string) => showToast('info', message);
  const loading = (message: string) => showToast('loading', message);

  useEffect(() => {
    toast.configure();
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, loading }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
