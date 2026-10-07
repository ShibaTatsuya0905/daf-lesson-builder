import { create } from 'zustand';
import { apiRequest } from '../services/apiClient';
import { useLessonStore } from './useLessonStore';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export type AuthMode = 'login' | 'register' | 'forgot_password';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: AuthMode;
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;

  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  sendRegisterOtp: (email: string, password: string) => Promise<boolean>;
  registerWithOtp: (name: string, email: string, password: string, otp: string) => Promise<boolean>;
  sendForgotOtp: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('daf_access_token'),
  refreshToken: localStorage.getItem('daf_refresh_token'),
  isAuthenticated: !!localStorage.getItem('daf_access_token'),
  isAuthModalOpen: false,
  authMode: 'login',
  isLoading: false,
  errorMessage: null,
  successMessage: null,

  openAuthModal: (mode = 'login') =>
    set({ isAuthModalOpen: true, authMode: mode, errorMessage: null, successMessage: null }),

  closeAuthModal: () => set({ isAuthModalOpen: false, errorMessage: null, successMessage: null }),

  setAuthMode: (authMode) => set({ authMode, errorMessage: null, successMessage: null }),

  checkAuth: async () => {
    const token = localStorage.getItem('daf_access_token');
    if (!token) return;

    try {
      const res = await apiRequest('/auth/me');
      if (res.ok) {
        const user = await res.json();
        set({ user, isAuthenticated: true });
        localStorage.setItem('daf_user', JSON.stringify(user));

        if (user.role === 'ADMIN') {
          useLessonStore.getState().toggleAdminView(true);
        }
      } else {
        set({ user: null, isAuthenticated: false });
        useLessonStore.getState().toggleAdminView(false);
      }
    } catch {
      set({ user: null, isAuthenticated: false });
      useLessonStore.getState().toggleAdminView(false);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, errorMessage: null, successMessage: null });
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ errorMessage: data.message || 'Đăng nhập thất bại', isLoading: false });
        return false;
      }

      localStorage.setItem('daf_access_token', data.accessToken);
      localStorage.setItem('daf_refresh_token', data.refreshToken);
      localStorage.setItem('daf_user', JSON.stringify(data.user));

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isAuthModalOpen: false,
        isLoading: false,
      });

      if (data.user.role === 'ADMIN') {
        useLessonStore.getState().toggleAdminView(true);
      } else {
        useLessonStore.getState().toggleAdminView(false);
      }

      return true;
    } catch {
      set({ errorMessage: 'Không thể kết nối đến máy chủ Backend', isLoading: false });
      return false;
    }
  },

  sendRegisterOtp: async (email, password) => {
    set({ isLoading: true, errorMessage: null, successMessage: null });
    try {
      const res = await fetch('http://localhost:3000/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ errorMessage: data.message, isLoading: false });
        return false;
      }

      set({
        successMessage: 'Mã OTP đã được gửi về email của bạn',
        isLoading: false,
      });
      return true;
    } catch {
      set({ errorMessage: 'Lỗi gửi yêu cầu OTP', isLoading: false });
      return false;
    }
  },

  registerWithOtp: async (name, email, password, otp) => {
    set({ isLoading: true, errorMessage: null, successMessage: null });
    try {
      const res = await fetch('http://localhost:3000/api/auth/register-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ errorMessage: data.message, isLoading: false });
        return false;
      }

      localStorage.setItem('daf_access_token', data.accessToken);
      localStorage.setItem('daf_refresh_token', data.refreshToken);
      localStorage.setItem('daf_user', JSON.stringify(data.user));

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isAuthModalOpen: false,
        isLoading: false,
      });
      return true;
    } catch {
      set({ errorMessage: 'Không thể kết nối đến máy chủ Backend', isLoading: false });
      return false;
    }
  },

  sendForgotOtp: async (email) => {
    set({ isLoading: true, errorMessage: null, successMessage: null });
    try {
      const res = await fetch('http://localhost:3000/api/auth/send-forgot-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ errorMessage: data.message, isLoading: false });
        return false;
      }

      set({
        successMessage: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn',
        isLoading: false,
      });
      return true;
    } catch {
      set({ errorMessage: 'Lỗi kết nối máy chủ', isLoading: false });
      return false;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    set({ isLoading: true, errorMessage: null, successMessage: null });
    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ errorMessage: data.message, isLoading: false });
        return false;
      }

      set({
        authMode: 'login',
        successMessage: 'Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.',
        isLoading: false,
      });
      return true;
    } catch {
      set({ errorMessage: 'Lỗi kết nối máy chủ', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    if (refreshToken) {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {}
    }

    localStorage.removeItem('daf_access_token');
    localStorage.removeItem('daf_refresh_token');
    localStorage.removeItem('daf_user');

    useLessonStore.getState().toggleAdminView(false);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));