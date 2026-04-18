import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';
import { useSocketStore } from './useSocketStore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isCheckingAuth: true,
      isLoading: false,
      error: null,

      checkAuth: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isCheckingAuth: false });
          useSocketStore.getState().connect();
        } catch {
          set({ user: null, isCheckingAuth: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', formData);
          set({ user: data.user, isLoading: false });
          useSocketStore.getState().connect();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed.';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', credentials);
          set({ user: data.user, isLoading: false });
          useSocketStore.getState().connect();
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed.';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        useSocketStore.getState().disconnect();
        set({ user: null });
        localStorage.removeItem('noothing-auth');
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      changeUsername: async (data) => {
        const res = await api.put('/auth/change-username', data);
        get().updateUser({ username: res.data.username });
        return res.data;
      },

      changePassword: async (data) => {
        const res = await api.put('/auth/change-password', data);
        return res.data;
      },

      switchAccount: async (targetUserId) => {
        const { data } = await api.post(`/users/switch-account/${targetUserId}`);
        useSocketStore.getState().disconnect();
        set({ user: data.user });
        useSocketStore.getState().connect();
        return data;
      },
    }),
    {
      name: 'noothing-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);