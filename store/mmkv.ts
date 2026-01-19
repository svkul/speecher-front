import { createMMKV, MMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware/persist";
import { Platform } from "react-native";

type MMKVStorageProps = {
  storageId: string;
  encryptionKey?: string;
};

type MMKVStorageReturnType = {
  storage: MMKV | WebStorage;
  actions: StateStorage;
};

// Web storage fallback for localStorage
class WebStorage {
  private storageId: string;

  constructor(storageId: string) {
    this.storageId = storageId;
  }

  private getKey(key: string): string {
    return `${this.storageId}:${key}`;
  }

  getString(key: string): string | undefined {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !window.localStorage) {
      return undefined;
    }
    const value = window.localStorage.getItem(this.getKey(key));
    return value ?? undefined;
  }

  set(key: string, value: string): void {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(this.getKey(key), value);
  }

  remove(key: string): void {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(this.getKey(key));
  }
}

export const AUTH_STORAGE_ID = "auth-storage";
export const LANGUAGE_STORAGE_ID = "language-storage";
export const THEME_STORAGE_ID = "theme-storage";

const mmkvInstances = new Map<string, MMKVStorageReturnType>();

export const createMMKVStorage = ({
  storageId,
  encryptionKey,
}: MMKVStorageProps): MMKVStorageReturnType => {
  const cacheKey = encryptionKey ? `${storageId}:${encryptionKey}` : storageId;

  // Return existing instance if already created
  if (mmkvInstances.has(cacheKey)) {
    return mmkvInstances.get(cacheKey)!;
  }

  let storage: MMKV | WebStorage;

  // Use localStorage for web platform
  if (Platform.OS === "web") {
    storage = new WebStorage(storageId);
  } else {
    const options = encryptionKey 
      ? { id: storageId, encryptionKey }
      : { id: storageId };

    storage = createMMKV(options);
  }

  const result = {
    storage,
    actions: {
      setItem: (name: string, value: string) => storage.set(name, value),
      getItem: (name: string) => storage.getString(name) ?? null,
      removeItem: (name: string) => storage.remove(name),
    },
  };

  mmkvInstances.set(cacheKey, result);
  return result;
};

export const authMMKVStorage = createMMKVStorage({
  storageId: AUTH_STORAGE_ID,
  encryptionKey: process.env.EXPO_PUBLIC_AUTH_ENCRYPTION_KEY,
});

export const languageMMKVStorage = createMMKVStorage({
  storageId: LANGUAGE_STORAGE_ID,
});

export const themeMMKVStorage = createMMKVStorage({
  storageId: THEME_STORAGE_ID,
});
