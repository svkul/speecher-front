import { api } from './client';
import { UserResponse } from './types';

/**
 * Request DTO for updating user profile
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/**
 * Get current authenticated user
 * GET /user/me
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useQuery hook to handle errors
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get<UserResponse>('/user/me');
  return response.data;
}

/**
 * Update current user profile
 * PATCH /user/me
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useMutation hook to handle errors
 */
export async function updateCurrentUser(
  data: UpdateUserRequest,
): Promise<UserResponse> {
  const response = await api.patch<UserResponse>('/user/me', data);
  return response.data;
}
