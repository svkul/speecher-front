import { api } from './client';
import { SpeechResponse } from './types';

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