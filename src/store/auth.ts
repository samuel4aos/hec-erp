import { create } from 'zustand';
import { api } from '../utils/api';

export type UserRole = 'hq_admin' | 'pastor' | 'treasurer' | 'ushers' | 'admin_staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  branch: {
    id: string;
    name: string;
    code: string;
    city: string;
    country: string;
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('hec_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.login(email, password);
      localStorage.setItem('hec_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  demoLogin: async (email) => {
    set({ loading: true, error: null });
    try {
      const data = await api.demoLogin(email);
      localStorage.setItem('hec_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('hec_token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('hec_token');
    if (!token) {
      set({ user: null, token: null, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const user = await api.me();
      set({ user, token, loading: false });
    } catch {
      localStorage.removeItem('hec_token');
      set({ user: null, token: null, loading: false });
    }
  },
}));
