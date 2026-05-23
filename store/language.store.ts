import { create } from 'zustand';
import i18n from '@services/i18n.service';
import * as SecureStore from 'expo-secure-store';

const LANG_KEY = 'user_language';

interface LanguageStore {
  locale: 'en' | 'hi';
  setLocale: (locale: 'en' | 'hi') => Promise<void>;
  initLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  locale: 'en',
  setLocale: async (locale) => {
    i18n.locale = locale;
    await SecureStore.setItemAsync(LANG_KEY, locale);
    set({ locale });
  },
  initLanguage: async () => {
    try {
      const saved = await SecureStore.getItemAsync(LANG_KEY);
      if (saved === 'hi' || saved === 'en') {
        i18n.locale = saved;
        set({ locale: saved as 'en' | 'hi' });
      } else {
        // Fallback to detected device default
        set({ locale: i18n.locale as 'en' | 'hi' });
      }
    } catch {
      set({ locale: i18n.locale as 'en' | 'hi' });
    }
  }
}));

// Quick hook selector helper
export const useLanguage = () => useLanguageStore((s) => s.locale);
