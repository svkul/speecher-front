import { Platform } from "react-native";
import { authMMKVStorage } from "./mmkv";

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry?: Date;
  refreshTokenExpiry?: Date;
}

/**
 * Save authentication tokens to secure storage
 * For web platform: tokens are stored in httpOnly cookies by backend, so we skip storage
 * For mobile platforms: tokens are stored in MMKV secure storage
 */
export const saveTokens = (tokens: TokenData): void => {
  // On web, tokens are managed by httpOnly cookies, no need to store them
  if (Platform.OS === "web") {
    return;
  }

  authMMKVStorage.storage.set("accessToken", tokens.accessToken);
  authMMKVStorage.storage.set("refreshToken", tokens.refreshToken);

  if (tokens.accessTokenExpiry) {
    authMMKVStorage.storage.set(
      "accessTokenExpiry",
      tokens.accessTokenExpiry.toISOString()
    );
  }

  if (tokens.refreshTokenExpiry) {
    authMMKVStorage.storage.set(
      "refreshTokenExpiry",
      tokens.refreshTokenExpiry.toISOString()
    );
  }
};

/**
 * Get access token from storage
 * For web platform: tokens are in httpOnly cookies, return null
 * For mobile platforms: get from MMKV storage
 */
export const getAccessToken = (): string | null => {
  // On web, tokens are in httpOnly cookies
  if (Platform.OS === "web") {
    return null;
  }

  return authMMKVStorage.storage.getString("accessToken") || null;
};

/**
 * Get refresh token from storage
 * For web platform: tokens are in httpOnly cookies, return null
 * For mobile platforms: get from MMKV storage
 */
export const getRefreshToken = (): string | null => {
  // On web, tokens are in httpOnly cookies
  if (Platform.OS === "web") {
    return null;
  }

  return authMMKVStorage.storage.getString("refreshToken") || null;
};

/**
 * Get all tokens from storage
 * For web platform: tokens are in httpOnly cookies, return null
 * For mobile platforms: get from MMKV storage
 */
export const getTokens = (): TokenData | null => {
  // On web, tokens are in httpOnly cookies
  if (Platform.OS === "web") {
    return null;
  }

  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    return null;
  }

  const accessTokenExpiry =
    authMMKVStorage.storage.getString("accessTokenExpiry");
  const refreshTokenExpiry =
    authMMKVStorage.storage.getString("refreshTokenExpiry");

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: accessTokenExpiry
      ? new Date(accessTokenExpiry)
      : undefined,
    refreshTokenExpiry: refreshTokenExpiry
      ? new Date(refreshTokenExpiry)
      : undefined,
  };
};

/**
 * Clear all authentication tokens
 * For web platform: tokens are in httpOnly cookies, they will be cleared by backend
 * For mobile platforms: remove from MMKV storage
 */
export const clearTokens = (): void => {
  // On web, tokens are in httpOnly cookies and will be cleared by backend
  if (Platform.OS === "web") {
    return;
  }

  authMMKVStorage.storage.remove("accessToken");
  authMMKVStorage.storage.remove("refreshToken");
  authMMKVStorage.storage.remove("accessTokenExpiry");
  authMMKVStorage.storage.remove("refreshTokenExpiry");
};

/**
 * Check if user has valid tokens in storage
 * For web platform: Always returns false because tokens are in httpOnly cookies
 *                   and not accessible from JS. Use backend validation instead.
 * For mobile platforms: Check if tokens exist in MMKV storage
 *
 * Note: On web, returning false doesn't mean user is not authenticated.
 *       The backend will validate tokens from httpOnly cookies on each request.
 */
export const hasValidTokens = (): boolean => {
  // On web, we can't check httpOnly cookies from JS
  // User state will be validated by backend on each request
  if (Platform.OS === "web") {
    return false; // Tokens are in httpOnly cookies, not accessible from JS
  }

  const tokens = getTokens();
  return tokens !== null;
};
