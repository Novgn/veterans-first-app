import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
  isFirstLaunch: boolean;
  hasSeenOnboarding: boolean;
  setFirstLaunch: (value: boolean) => void;
  setHasSeenOnboarding: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isFirstLaunch: true,
      hasSeenOnboarding: false,
      setFirstLaunch: (value) => set({ isFirstLaunch: value }),
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
    }),
    {
      name: 'veterans-1st-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
