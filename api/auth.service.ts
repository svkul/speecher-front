import { api } from './client';
import { UserResponse } from './types';

/**
 * OAuth provider enum
 */
export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

/**
 * Request DTO for OAuth sign in
 */
export interface OAuthSignInRequest {
  provider: OAuthProvider;
  idToken: string;
}

/**
 * Response DTO for authentication operations
 */
export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

/**
 * Sign in with OAuth (Google or Apple)
 * POST /auth/oauth
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useMutation hook to handle errors
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  idToken: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/oauth', {
    provider,
    idToken,
  });
  return response.data;
}

/**
 * Sign out current user
 * POST /auth/signout
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useMutation hook to handle errors
 */
export async function signOut(): Promise<void> {
  await api.post('/auth/signout');
}
