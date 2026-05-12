import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
