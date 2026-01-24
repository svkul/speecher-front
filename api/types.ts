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
 * Speech Block response
 */
export interface SpeechBlockResponse {
  id: string;
  speechId: string;
  order: number;
  title: string;
  text: string;
  audioUrl: string | null;
  duration: number | null;
  ttsLanguage: string | null;
  ttsVoice: string | null;
  ttsModel: string | null;
  ttsStyle: string | null;
  charactersUsed: number | null;
  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Speech response
 */
export interface SpeechResponse {
  id: string;
  userId: string;
  title: string;
  blocks: SpeechBlockResponse[];
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
