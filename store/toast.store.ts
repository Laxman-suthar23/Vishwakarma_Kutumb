import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface ToastStore {
  visible: boolean;
  message: string;
  title: string;
  type: ToastType;
  duration: number;
  showToast: (config: ToastConfig | string) => void;
  hideToast: () => void;
}

let timeoutId: any = null;

export const useToastStore = create<ToastStore>((set, get) => ({
  visible: false,
  message: '',
  title: '',
  type: 'info',
  duration: 3000,

  showToast: (config) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const parsedConfig: ToastConfig =
      typeof config === 'string'
        ? { message: config, type: 'info' }
        : config;

    const defaultTitles: Record<ToastType, string> = {
      success: 'Success',
      error: 'Error',
      info: 'Info',
      warning: 'Warning',
    };

    set({
      visible: true,
      message: parsedConfig.message,
      title: parsedConfig.title || defaultTitles[parsedConfig.type] || '',
      type: parsedConfig.type,
      duration: parsedConfig.duration || 3000,
    });

    timeoutId = setTimeout(() => {
      get().hideToast();
    }, parsedConfig.duration || 3000);
  },

  hideToast: () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    set({ visible: false });
  },
}));

export const useToast = () => {
  const { visible, message, title, type, showToast, hideToast } = useToastStore();
  return { visible, message, title, type, showToast, hideToast };
};
