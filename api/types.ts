/**
 * Common API types
 * Shared types for API requests and responses
 */

/**
 * User response DTO
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  language: string | null;
  trialUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Error response from API (RFC 7807)
 */
export interface AppErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path?: string;
  reason?: string;
  field?: string;
  severity?: string;
  metadata?: Record<string, unknown>;
}
