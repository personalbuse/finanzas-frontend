import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useStore();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
