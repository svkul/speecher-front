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
 * Voice information from Google TTS
 */
export interface VoiceDto {
  languageCodes: string[];
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  naturalSampleRateHertz: number;
}

/**
 * Language information
 */
export interface LanguageDto {
  code: string;
  name: string;
  availableVoices: number;
}

/**
 * TTS Model information
 */
export interface TtsModelInfoDto {
  name: string;
  price: number;
  freeLimit: number;
  description: string;
}

/**
 * Response containing list of available languages
 */
export interface LanguagesListResponse {
  languages: LanguageDto[];
}

/**
 * Response containing list of available voices
 */
export interface VoicesListResponse {
  voices: VoiceDto[];
}

/**
 * Response containing available models for user
 */
export interface ModelsListResponse {
  models: TtsModelInfoDto[];
  recommendedModel: string;
}

/**
 * Create Speech Block DTO
 */
export interface CreateSpeechBlockDto {
  title: string;
  text: string;
  order: number;
  ttsLanguage?: string;
  ttsVoice?: string;
  ttsModel?: string;
  ttsStyle?: string;
}

/**
 * Create Speech DTO
 */
export interface CreateSpeechDto {
  title: string;
  blocks: CreateSpeechBlockDto[];
}

/**
 * Update Speech DTO
 */
export interface UpdateSpeechDto {
  title?: string;
}

/**
 * Update Speech Block DTO
 */
export interface UpdateSpeechBlockDto {
  title?: string;
  text?: string;
  order?: number;
  ttsLanguage?: string;
  ttsVoice?: string;
  ttsModel?: string;
  ttsStyle?: string;
}

/**
 * Generate Audio DTO
 */
export interface GenerateAudioDto {
  languageCode?: string;
  voiceName?: string;
  model?: string;
  speakingRate?: number;
  pitch?: number;
}

/**
 * Audio Generation Response
 */
export interface AudioGenerationResponse {
  blockId: string;
  audioUrl: string;
  duration: number;
  charactersUsed: number;
  success: boolean;
  error?: string;
}

/**
 * Batch Audio Generation Response
 */
export interface BatchAudioGenerationResponse {
  speechId: string;
  results: AudioGenerationResponse[];
  totalCharactersUsed: number;
  successCount: number;
  failureCount: number;
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
