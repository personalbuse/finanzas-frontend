import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useStore } from '../store/useStore';
import { toast } from 'react-toastify';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { user, token, login: storeLogin, logout: storeLogout, loadFromStorage, clearStorage } = useStore();

  useEffect(() => {
    loadFromStorage();
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (user: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    storeLogin(user, token);
    toast.success('¡Bienvenido de vuelta!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    storeLogout();
    clearStorage();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!token,
      user,
      token,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
