import { create } from "zustand";

interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: "CUSTOMER" | "ADMIN";
  bonusPoints: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));