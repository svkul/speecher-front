import { api } from './client';
import {
  SpeechResponse,
  CreateSpeechDto,
  UpdateSpeechDto,
  UpdateSpeechBlockDto,
  GenerateAudioDto,
  BatchAudioGenerationResponse,
  LanguagesListResponse,
  VoicesListResponse,
  ModelsListResponse,
} from './types';

/**
 * Get all speeches for current user
 * GET /speeches
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useQuery hook to handle errors
 */
export async function getSpeeches(): Promise<SpeechResponse[]> {
  const response = await api.get<SpeechResponse[]>('/speeches');
  return response.data;
}

/**
 * Get a single speech by ID
 * GET /speeches/:id
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useQuery hook to handle errors
 */
export async function getSpeech(id: string): Promise<SpeechResponse> {
  const response = await api.get<SpeechResponse>(`/speeches/${id}`);
  return response.data;
}

/**
 * Create a new speech
 * POST /speeches
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useMutation hook to handle errors
 */
export async function createSpeech(
  data: CreateSpeechDto,
): Promise<SpeechResponse> {
  const response = await api.post<SpeechResponse>('/speeches', data);
  return response.data;
}

/**
 * Get available TTS languages
 * GET /speeches/tts/languages
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useQuery hook to handle errors
 */
export async function getTtsLanguages(
  refresh?: boolean,
): Promise<LanguagesListResponse> {
  const response = await api.get<LanguagesListResponse>(
    '/speeches/tts/languages',
    {
      params: refresh ? { refresh: 'true' } : {},
    },
  );
  return response.data;
}

/**
 * Get available TTS voices
 * GET /speeches/tts/voices
 * 
 * @param language - Optional language code to filter voices (e.g., "en-US")
 * @param refresh - Optional flag to refresh the cache
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useQuery hook to handle errors
 */
export async function getTtsVoices(
  language?: string,
  refresh?: boolean,
): Promise<VoicesListResponse> {
  const params: Record<string, string> = {};
  if (language) {
    params.language = language;
  }
  if (refresh) {
    params.refresh = 'true';
  }
  const response = await api.get<VoicesListResponse>('/speeches/tts/voices', {
    params,
  });
  return response.data;
}

/**
 * Get available TTS models for current user
 * GET /speeches/tts/models
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useQuery hook to handle errors
 */
export async function getTtsModels(): Promise<ModelsListResponse> {
  const response = await api.get<ModelsListResponse>('/speeches/tts/models');
  return response.data;
}

/**
 * Update a speech
 * PATCH /speeches/:id
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useMutation hook to handle errors
 */
export async function updateSpeech(
  id: string,
  data: UpdateSpeechDto,
): Promise<SpeechResponse> {
  const response = await api.patch<SpeechResponse>(`/speeches/${id}`, data);
  return response.data;
}

/**
 * Update a speech block
 * PATCH /speeches/blocks/:blockId
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useMutation hook to handle errors
 */
export async function updateSpeechBlock(
  blockId: string,
  data: UpdateSpeechBlockDto,
): Promise<SpeechResponse['blocks'][0]> {
  const response = await api.patch<SpeechResponse['blocks'][0]>(
    `/speeches/blocks/${blockId}`,
    data,
  );
  return response.data;
}

/**
 * Generate audio for all blocks in a speech
 * POST /speeches/:id/generate-audio
 * 
 * @param id - Speech ID
 * @param settings - Optional audio generation settings
 * 
 * Note: Error handling is managed by TanStack Query
 * Use onError callback in useMutation hook to handle errors
 */
export async function generateAudio(
  id: string,
  settings?: GenerateAudioDto,
): Promise<BatchAudioGenerationResponse> {
  const response = await api.post<BatchAudioGenerationResponse>(
    `/speeches/${id}/generate-audio`,
    settings,
  );
  return response.data;
}