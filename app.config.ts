import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Reads and validates environment variables
 * @throws {Error} If required environment variables are missing
 */
const getEnvVars = () => {
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
  const API_TIMEOUT = process.env.EXPO_PUBLIC_API_TIMEOUT || '10000';
  const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

  // Validate required variables
  if (!BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_BASE_URL is required. Please set it in your .env file or environment variables.',
    );
  }

  // Validate ENV value
  if (ENV !== 'development' && ENV !== 'production') {
    throw new Error(
      `EXPO_PUBLIC_ENV must be either 'development' or 'production'. Got: ${ENV}`,
    );
  }

  // Validate API_TIMEOUT is a valid number
  const timeout = parseInt(API_TIMEOUT, 10);
  if (isNaN(timeout) || timeout <= 0) {
    throw new Error(
      `EXPO_PUBLIC_API_TIMEOUT must be a positive number. Got: ${API_TIMEOUT}`,
    );
  }

  return {
    BASE_URL,
    API_TIMEOUT: timeout,
    ENV: ENV as 'development' | 'production',
  };
};

/**
 * Expo configuration with environment variables
 * Environment variables are exposed through the 'extra' field
 * and can be accessed via expo-constants
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const envVars = getEnvVars();

  return {
    ...config,
    extra: {
      ...config.extra,
      ...envVars,
    },
  } as ExpoConfig;
};