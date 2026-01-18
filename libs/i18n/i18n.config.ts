import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import ruCommon from "./locales/ru/common.json";
import ukCommon from "./locales/uk/common.json";
import { LANGUAGE_STORAGE_ID, languageMMKVStorage } from "@/store/mmkv";

const resources = {
  uk: {
    common: ukCommon,
  },
  ru: {
    common: ruCommon,
  },
};

const getSavedLanguage = (): string => {
  if (typeof window === "undefined") {
    return "uk";
  }

  try {
    const saved = languageMMKVStorage.storage.getString(LANGUAGE_STORAGE_ID);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Zustand persist format: { state: { language: "uk" }, version: 0 }
        return parsed.state?.language || "uk";
      } catch {
        return "uk";
      }
    }
  } catch (error) {}

  return "uk";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getSavedLanguage(),
  fallbackLng: "uk",
  compatibilityJSON: "v4",
  interpolation: {
    escapeValue: false,
  },
  defaultNS: "common",
});

export default i18n;
