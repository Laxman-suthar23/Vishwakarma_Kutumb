import { create } from 'zustand';
import type { Village, Family } from '@types/index';

// ─── App Store for cached data & UI state ─────────────────────────────────────

interface AppStore {
  // Recently viewed families (for offline/cache)
  recentlyViewedFamilies: Family[];
  addRecentlyViewed: (family: Family) => void;
  clearRecentlyViewed: () => void;

  // Cached villages for offline fallback
  cachedVillages: Village[];
  setCachedVillages: (villages: Village[]) => void;

  // Global UI state
  isFirstLaunch: boolean;
  setFirstLaunch: (value: boolean) => void;

  // Filter preferences
  activeVillageFilter: string | null;
  setActiveVillageFilter: (id: string | null) => void;

  activeGotraFilter: string | null;
  setActiveGotraFilter: (gotra: string | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Recently viewed
  recentlyViewedFamilies: [],
  addRecentlyViewed: (family) => {
    const current = get().recentlyViewedFamilies;
    const filtered = current.filter((f) => f.$id !== family.$id);
    set({ recentlyViewedFamilies: [family, ...filtered].slice(0, 10) });
  },
  clearRecentlyViewed: () => set({ recentlyViewedFamilies: [] }),

  // Cached villages
  cachedVillages: [],
  setCachedVillages: (villages) => set({ cachedVillages: villages }),

  // First launch
  isFirstLaunch: true,
  setFirstLaunch: (value) => set({ isFirstLaunch: value }),

  // Filters
  activeVillageFilter: null,
  setActiveVillageFilter: (id) => set({ activeVillageFilter: id }),

  activeGotraFilter: null,
  setActiveGotraFilter: (gotra) => set({ activeGotraFilter: gotra }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const useRecentlyViewed = () =>
  useAppStore((s) => s.recentlyViewedFamilies);

export const useCachedVillages = () =>
  useAppStore((s) => s.cachedVillages);

export const useActiveFilters = () =>
  useAppStore((s) => ({
    villageId: s.activeVillageFilter,
    gotra: s.activeGotraFilter,
  }));
