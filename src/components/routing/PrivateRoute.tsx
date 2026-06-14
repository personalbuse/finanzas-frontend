import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function PrivateRoute({ children, requireAdmin }: PrivateRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setCheckingMaintenance(false);
      return;
    }
    fetch('/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.maintenance_mode === true) {
          setMaintenanceMode(true);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingMaintenance(false));
  }, [isAuthenticated]);

  if (loading || checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (maintenanceMode && user?.rol !== 'admin') {
    return <Navigate to="/maintenance" />;
  }

  if (requireAdmin && user?.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
