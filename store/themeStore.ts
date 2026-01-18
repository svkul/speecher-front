import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { THEME_STORAGE_ID, themeMMKVStorage } from "./mmkv";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: THEME_STORAGE_ID,
      storage: createJSONStorage(() => themeMMKVStorage.actions),
    }
  )
);
