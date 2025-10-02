'use client';
import { create } from 'zustand';

type AuthUser = { id: string; email: string | null };

type AuthState = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  setAuth: (user: AuthUser | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  setAuth: (user) => set({ user, isLoggedIn: !!user }),
  reset: () => set({ user: null, isLoggedIn: false }),
}));
