import { create } from 'zustand';
import { authService } from '@services/auth.service';
import type { AppUser, LoginCredentials } from '@types/index';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthStore {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRestoring: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
  setUser: (user: AppUser | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isRestoring: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch {
      // Force logout even if API fails
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  restoreSession: async () => {
    set({ isRestoring: true });
    try {
      const user = await authService.restoreSession();
      if (user) {
        set({ user, isAuthenticated: true, isRestoring: false });
      } else {
        set({ isRestoring: false });
      }
    } catch {
      set({ isRestoring: false });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const useIsSuperAdmin = () =>
  useAuthStore((s) => s.user?.role === 'SUPER_ADMIN');

export const useIsVillageAdmin = () =>
  useAuthStore((s) => s.user?.role === 'VILLAGE_ADMIN');

export const useAssignedVillage = () =>
  useAuthStore((s) => ({
    villageId: s.user?.assignedVillageId,
    villageName: s.user?.assignedVillageName,
  }));
