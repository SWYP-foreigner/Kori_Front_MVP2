import { create } from 'zustand';

interface NotificationState {
  isNotificationNeedsSetup: boolean;
  setIsNotificationNeedsSetup: (value: boolean) => void;
  resetNotificationState: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isNotificationNeedsSetup: true,
  setIsNotificationNeedsSetup: (value) => set({ isNotificationNeedsSetup: value }),
  resetNotificationState: () => set({ isNotificationNeedsSetup: true }),
}));
