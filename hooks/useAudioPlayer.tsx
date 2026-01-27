/**
 * Audio Player Hook
 * 
 * Custom hook for managing audio playback using expo-audio.
 * Provides controls for play/pause, speed adjustment, seeking, and track navigation.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAudioPlayer as useExpoAudioPlayer, useAudioPlayerStatus, AudioSource } from 'expo-audio';
import { SpeechBlockResponse } from '@/api/types';

/**
 * Available playback speeds
 */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

/**
 * Track interface for internal use
 */
interface Track {
  id: string;
  url: string;
  title: string;
  duration?: number;
}

/**
 * Audio player state
 */
interface AudioPlayerState {
  isInitialized: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  currentTrackIndex: number | null;
  playbackSpeed: PlaybackSpeed;
  progress: {
    position: number;
    duration: number;
    buffered: number;
  };
}

/**
 * Audio player actions
 */
interface AudioPlayerActions {
  initializePlayer: (blocks: SpeechBlockResponse[]) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: (seconds: number) => Promise<void>;
  skipBackward: (seconds: number) => Promise<void>;
  setSpeed: (speed: PlaybackSpeed) => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  playTrack: (index: number) => Promise<void>;
  cleanup: () => Promise<void>;
}

/**
 * Return type for useAudioPlayer hook
 */
export interface UseAudioPlayerReturn extends AudioPlayerState, AudioPlayerActions {
  tracks: Track[];
}

/**
 * Convert SpeechBlockResponse to Track format
 */
function convertBlocksToTracks(blocks: SpeechBlockResponse[]): Track[] {
  return blocks
    .filter(block => block.audioUrl) // Only blocks with audio
    .sort((a, b) => a.order - b.order) // Sort by order
    .map((block) => ({
      id: block.id,
      url: block.audioUrl!,
      title: block.title,
      duration: block.duration || undefined,
    }));
}

/**
 * Custom hook for audio player functionality using expo-audio
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeedState] = useState<PlaybackSpeed>(1);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(null);
  const isCleaningUpRef = useRef(false);
  
  // Use expo-audio player hook
  const player = useExpoAudioPlayer(currentSource || undefined, {
    updateInterval: 100, // Update every 100ms
  });

  // Get player status
  const status = useAudioPlayerStatus(player);

  // Update playback speed when it changes
  useEffect(() => {
    if (player && playbackSpeed !== undefined && player.isLoaded) {
      try {
        player.setPlaybackRate(playbackSpeed);
      } catch (error) {
        console.error('[AudioPlayer] Failed to set playback rate:', error);
      }
    }
  }, [player, playbackSpeed]);

  /**
   * Initialize the player with tracks
   */
  const initializePlayer = useCallback(async (blocks: SpeechBlockResponse[]) => {
    try {
      // Convert blocks to tracks
      const newTracks = convertBlocksToTracks(blocks);
      setTracks(newTracks);

      if (newTracks.length > 0) {
        setCurrentTrackIndex(0);
        // Set source for expo-audio
        const source = { uri: newTracks[0].url };
        setCurrentSource(source);
        setIsInitialized(true);
      } else {
        setIsInitialized(false);
      }
    } catch (error) {
      console.error('[AudioPlayer] Failed to initialize player:', error);
      throw error;
    }
  }, []);

  /**
   * Load a track by index
   */
  const loadTrack = useCallback(async (index: number) => {
    if (index < 0 || index >= tracks.length) {
      return;
    }

    try {
      const track = tracks[index];
      const newSource = { uri: track.url };
      
      // Use replace if player is already loaded, otherwise set source
      if (player && player.isLoaded && currentSource) {
        player.replace(newSource);
      } else {
        setCurrentSource(newSource);
      }
      
      setCurrentTrackIndex(index);
    } catch (error) {
      console.error('Failed to load track:', error);
      throw error;
    }
  }, [tracks, player, currentSource]);

  /**
   * Play audio
   */
  const play = useCallback(async () => {
    try {
      if (!currentSource && currentTrackIndex !== null && tracks.length > 0) {
        await loadTrack(currentTrackIndex);
      }
      if (player) {
        player.play();
      }
    } catch (error) {
      console.error('Failed to play:', error);
    }
  }, [currentSource, currentTrackIndex, tracks, loadTrack, player]);

  /**
   * Pause audio
   */
  const pause = useCallback(async () => {
    try {
      if (player) {
        player.pause();
      }
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }, [player]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async () => {
    const playing = status?.playing || false;
    if (playing) {
      await pause();
    } else {
      await play();
    }
  }, [status?.playing, play, pause]);

  /**
   * Seek to specific position in seconds
   */
  const seekTo = useCallback(async (position: number) => {
    try {
      if (player) {
        player.seekTo(position);
      }
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }, [player]);

  /**
   * Skip forward by specified seconds
   */
  const skipForward = useCallback(async (seconds: number) => {
    try {
      if (player && status?.currentTime !== undefined) {
        const newPosition = status.currentTime + seconds;
        player.seekTo(newPosition);
      }
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  }, [player, status?.currentTime]);

  /**
   * Skip backward by specified seconds
   */
  const skipBackward = useCallback(async (seconds: number) => {
    try {
      if (player && status?.currentTime !== undefined) {
        const newPosition = Math.max(0, status.currentTime - seconds);
        player.seekTo(newPosition);
      }
    } catch (error) {
      console.error('Failed to skip backward:', error);
    }
  }, [player, status?.currentTime]);

  /**
   * Set playback speed
   */
  const setSpeed = useCallback(async (speed: PlaybackSpeed) => {
    try {
      if (player && player.isLoaded) {
        player.setPlaybackRate(speed);
        setPlaybackSpeedState(speed);
      } else {
        setPlaybackSpeedState(speed);
      }
    } catch (error) {
      console.error('[AudioPlayer] Failed to set speed:', error);
    }
  }, [player]);

  /**
   * Play next track
   */
  const nextTrack = useCallback(async () => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      await loadTrack(currentTrackIndex + 1);
      await play();
    }
  }, [currentTrackIndex, tracks.length, loadTrack, play]);

  /**
   * Play previous track
   */
  const previousTrack = useCallback(async () => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      await loadTrack(currentTrackIndex - 1);
      await play();
    }
  }, [currentTrackIndex, loadTrack, play]);

  /**
   * Play specific track by index
   */
  const playTrack = useCallback(async (index: number) => {
    await loadTrack(index);
    await play();
  }, [loadTrack, play]);

  /**
   * Cleanup player on unmount
   */
  const cleanup = useCallback(async () => {
    // Prevent multiple cleanup calls
    if (isCleaningUpRef.current) {
      return;
    }
    
    isCleaningUpRef.current = true;
    
    try {
      // Only pause if player is loaded and valid
      if (player && player.isLoaded && typeof player.pause === 'function') {
        try {
          // Check if player is still playing before pausing
          if (player.playing) {
            player.pause();
          }
        } catch (pauseError) {
          // Ignore pause errors during cleanup - player may already be released
        }
      }
    } catch (error) {
      // Silently ignore cleanup errors - player may already be released
    } finally {
      // Always reset state, even if pause failed
      setCurrentSource(null);
      setIsInitialized(false);
      setCurrentTrackIndex(null);
      setTracks([]);
      isCleaningUpRef.current = false;
    }
  }, [player]);

  // Update source when tracks change
  useEffect(() => {
    if (isInitialized && tracks.length > 0 && currentTrackIndex !== null) {
      const track = tracks[currentTrackIndex];
      if (track) {
        const newSource = { uri: track.url };
        const currentUri = currentSource && typeof currentSource === 'object' && currentSource !== null && 'uri' in currentSource 
          ? (currentSource as { uri?: string }).uri 
          : typeof currentSource === 'string' 
            ? currentSource 
            : null;
        if (!currentSource || currentUri !== track.url) {
          if (player && player.isLoaded) {
            player.replace(newSource);
          } else {
            setCurrentSource(newSource);
          }
        }
      }
    }
  }, [isInitialized, tracks, currentTrackIndex, currentSource, player]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);


  // Determine loading state - only show loading if actively buffering
  const isLoading = player?.isBuffering || false;

  // Get current status
  const isPlaying = status?.playing || false;
  const progress = {
    position: status?.currentTime || 0,
    duration: status?.duration || 0,
    buffered: 0,
  };

  return {
    // State
    isInitialized,
    isPlaying,
    isLoading,
    currentTrackIndex,
    playbackSpeed: playbackSpeed,
    progress,
    tracks,

    // Actions
    initializePlayer,
    play,
    pause,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setSpeed,
    nextTrack,
    previousTrack,
    playTrack,
    cleanup,
  };
}
