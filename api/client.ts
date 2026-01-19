import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

import { config } from '@/config';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '@/store/authStorage';
import { useUserStore } from '@/store/userStore';
import { useLanguageStore } from '@/store/languageStore';
import { AppErrorResponse } from './types';

export const api = axios.create({
  baseURL: config.baseUrl,
  timeout: config.apiTimeout,
  // Include credentials (cookies) for web platform
  withCredentials: Platform.OS === 'web',
});

/**
 * Request interceptor to attach authentication tokens and language to every request
 * For web platform: only language and client type headers (tokens in httpOnly cookies)
 * For mobile platforms: tokens in headers
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const language = useLanguageStore.getState().language;

    // Set language header for all platforms
    config.headers['x-language'] = language || 'uk';

    // For web platform: add client type header, tokens will be in cookies
    if (Platform.OS === 'web') {
      config.headers['x-client-type'] = 'expo-web';
    } else {
      // For mobile platforms: add tokens to headers
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle:
 * 1. Token refresh from response headers (for mobile clients)
 * 2. Authentication errors (401)
 * 3. Other error handling
 */
api.interceptors.response.use(
  (response) => {
    // Check if tokens were refreshed by backend (for mobile clients)
    // Backend may return new tokens in response headers
    const accessToken = response.headers['x-access-token'];
    const refreshToken = response.headers['x-refresh-token'];
    const accessTokenExpiry = response.headers['x-access-token-expiry'];
    const refreshTokenExpiry = response.headers['x-refresh-token-expiry'];

    if (Platform.OS !== 'web' && (accessToken || refreshToken)) {
      // Save new tokens to secure storage
      saveTokens({
        accessToken: accessToken || getAccessToken() || '',
        refreshToken: refreshToken || getRefreshToken() || '',
        accessTokenExpiry: accessTokenExpiry
          ? new Date(accessTokenExpiry)
          : undefined,
        refreshTokenExpiry: refreshTokenExpiry
          ? new Date(refreshTokenExpiry)
          : undefined,
      });
    }

    return response;
  },
  async (error: AxiosError<AppErrorResponse>) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      const errorData = error.response.data;

      // Check if this is a session expired error
      if (errorData?.code === 'SESSION_EXPIRED' || errorData?.code === 'UNAUTHORIZED') {
        // Clear tokens and user for all auth errors
        clearTokens();
        useUserStore.getState().clearUser();

        // Open auth modal
        setTimeout(() => {
          useUserStore.getState().setIsAuthModalOpen(true);
        }, 0);
      }

      // For mobile: if we have a refresh token, backend should have refreshed it automatically
      // If we still get 401, it means refresh failed or tokens are invalid
      // For web: tokens are in cookies, backend handles refresh automatically
    }

    return Promise.reject(error);
  }
);