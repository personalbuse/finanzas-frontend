import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
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
  isHydrated: boolean;
  setAuth: (user: User) => void;
  clear: () => void;
  updateBalance: (newBalance: number) => void;
  setHydrated: (value: boolean) => void;
}

const STORAGE_KEY = 'simulador-auth-v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,

      setAuth: (user) =>
        set({ user }),

      clear: () => set({ user: null }),

      updateBalance: (newBalance) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, current_balance: newBalance } }
            : state,
        ),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
