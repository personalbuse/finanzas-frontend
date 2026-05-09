import React from 'react';
import { ToastContainer as ToastifyContainer } from 'react-toastify';
import './Toast.css';

interface ToastContainerProps {
  children?: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <>
      {children}
      <ToastifyContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
        className="toast-container"
        bodyClassName="toast-body"
        toastClassName={(toast) => `toast-wrapper toast-${toast.type}`}
      />
    </>
  );
}

export default ToastContainer;
