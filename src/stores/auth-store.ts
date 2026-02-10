import { create } from 'zustand';
import { SecondMeUser } from '@/types';

interface AuthState {
  user: SecondMeUser | null;
  isLoading: boolean;
  setUser: (user: SecondMeUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    set({ user: null, isLoading: false });
    fetch('/api/auth/logout', { method: 'POST' });
  },
}));
