import { create } from 'zustand';

interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDestructive?: boolean;
}

interface ConfirmStore {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive: boolean;
  onConfirmCallback: (() => void | Promise<void>) | null;
  onCancelCallback: (() => void) | null;
  showConfirm: (config: ConfirmConfig) => void;
  hideConfirm: () => void;
  triggerConfirm: () => Promise<void>;
  triggerCancel: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  visible: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isDestructive: false,
  onConfirmCallback: null,
  onCancelCallback: null,

  showConfirm: (config) => {
    set({
      visible: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      isDestructive: config.isDestructive || false,
      onConfirmCallback: config.onConfirm,
      onCancelCallback: config.onCancel || null,
    });
  },

  hideConfirm: () => {
    set({ visible: false });
  },

  triggerConfirm: async () => {
    const callback = get().onConfirmCallback;
    set({ visible: false });
    if (callback) {
      await callback();
    }
  },

  triggerCancel: () => {
    const callback = get().onCancelCallback;
    set({ visible: false });
    if (callback) {
      callback();
    }
  },
}));

export const useConfirm = () => {
  const { showConfirm, hideConfirm } = useConfirmStore();
  return { confirm: showConfirm, closeConfirm: hideConfirm };
};
