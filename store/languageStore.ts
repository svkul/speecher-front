import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LANGUAGE_STORAGE_ID, languageMMKVStorage } from "./mmkv";

export type Language = "uk" | "ru";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "uk",
      setLanguage: (language) => {
        set({ language });
        // i18next will be synced via useEffect in app layout
      },
    }),
    {
      name: LANGUAGE_STORAGE_ID,
      storage: createJSONStorage(() => languageMMKVStorage.actions),
    }
  )
);
