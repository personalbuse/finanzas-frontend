import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/useAuthStore';
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
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const { loadFromStorage, clearStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (user: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setToken(token);
    toast.success('¡Bienvenido de vuelta!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
