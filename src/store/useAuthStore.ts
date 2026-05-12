import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';

interface User {
  id: number;
  username: string;
  email: string;
  initial_balance: number;
  current_balance: number;
  rol: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => {
        set({ user, token });
      },

      logout: () => {
        set({ user: null, token: null });
        toast.success('Sesión cerrada correctamente');
      },

      loadFromStorage: () => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          try {
            set({ user: JSON.parse(storedUser), token: storedToken });
          } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            set({ user: null, token: null });
          }
        }
      },

      clearStorage: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('i18nextLng');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
