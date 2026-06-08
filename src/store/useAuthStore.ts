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
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string | null) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
  updateBalance: (newBalance: number) => void;
  setHydrated: (value: boolean) => void;
}

const STORAGE_KEY = 'simulador-auth-v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,

      setAuth: (user, accessToken, refreshToken = null) =>
        set({ user, accessToken, refreshToken }),

      setAccessToken: (token) => set({ accessToken: token }),

      clear: () => set({ user: null, accessToken: null, refreshToken: null }),

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
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
