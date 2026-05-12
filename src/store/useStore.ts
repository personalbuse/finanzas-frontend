import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  updateBalance: (newBalance: number) => void;
  loadFromStorage: () => void;
  saveToStorage: (key: string, value: string) => void;
  clearStorage: () => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: (user, token) =>
        set({ user, token }),

      logout: () =>
        set({ user: null, token: null }),

      updateBalance: (newBalance: number) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, current_balance: newBalance };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
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

      saveToStorage: (key, value) => {
        localStorage.setItem(key, value);
      },

      clearStorage: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
