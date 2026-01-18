import Constants from 'expo-constants';

/**
 * Application configuration
 * Provides type-safe access to environment variables
 * Values are set in app.config.ts and exposed via expo-constants
 */
export const config = {
  /**
   * Base URL for API requests
   * Set via EXPO_PUBLIC_BASE_URL environment variable
   */
  baseUrl: Constants.expoConfig?.extra?.BASE_URL as string,

  /**
   * API request timeout in milliseconds
   * Set via EXPO_PUBLIC_API_TIMEOUT environment variable
   * Default: 10000ms
   */
  apiTimeout: (Constants.expoConfig?.extra?.API_TIMEOUT as number) ?? 10000,

  /**
   * Current environment: 'development' | 'production'
   * Set via EXPO_PUBLIC_ENV environment variable
   * Default: 'development'
   */
  env: (Constants.expoConfig?.extra?.ENV as 'development' | 'production') ??
    'development',

  /**
   * OAuth Configuration
   */
  oauth: {
    google: {
      clientIdWeb: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID_WEB as
        | string
        | undefined,
      clientIdIos: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID_IOS as
        | string
        | undefined,
      clientIdAndroid: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID_ANDROID as
        | string
        | undefined,
    },
  },
} as const;