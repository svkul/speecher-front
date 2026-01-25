/**
 * Audio Player Component
 * 
 * A comprehensive audio player with playback controls, speed adjustment,
 * and track navigation for speech blocks.
 */

import { View, Pressable, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { SpeechBlockResponse } from '@/api/types';
import { useAudioPlayer, PLAYBACK_SPEEDS, PlaybackSpeed } from '@/hooks/useAudioPlayer';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useThemeStore } from '@/store/themeStore';
import { THEME } from '@/libs/theme';
import { cn } from '@/libs/utils';

interface AudioPlayerProps {
  blocks: SpeechBlockResponse[];
  className?: string;
}

/**
 * Format time in seconds to MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ blocks, className }: AudioPlayerProps) {
  const { theme } = useThemeStore();
  
  console.log('[AudioPlayer Component] Rendering with blocks:', blocks?.length);
  console.log('[AudioPlayer Component] Blocks:', blocks);
  
  const {
    isInitialized,
    isPlaying,
    isLoading,
    currentTrackIndex,
    playbackSpeed,
    progress,
    tracks,
    initializePlayer,
    togglePlayPause,
    skipForward,
    skipBackward,
    setSpeed,
    nextTrack,
    previousTrack,
    seekTo,
    cleanup,
  } = useAudioPlayer();

  console.log('[AudioPlayer Component] State:', {
    isInitialized,
    isLoading,
    tracksLength: tracks.length,
    currentTrackIndex,
  });

  // Initialize player when blocks change
  useEffect(() => {
    console.log('[AudioPlayer Component] useEffect triggered with blocks:', blocks?.length);
    const blocksWithAudio = blocks.filter(b => b.audioUrl);
    console.log('[AudioPlayer Component] Blocks with audio:', blocksWithAudio.length);
    if (blocksWithAudio.length > 0) {
      console.log('[AudioPlayer Component] Calling initializePlayer');
      initializePlayer(blocks);
    }

    return () => {
      console.log('[AudioPlayer Component] Cleanup');
      cleanup();
    };
  }, [blocks, initializePlayer, cleanup]);

  // Don't render if no audio blocks
  const blocksWithAudio = blocks.filter(b => b.audioUrl);
  console.log('[AudioPlayer Component] Blocks with audio for render check:', blocksWithAudio.length);
  
  if (blocksWithAudio.length === 0) {
    console.log('[AudioPlayer Component] No blocks with audio, returning null');
    return null;
  }

  // Show loading spinner only while initializing (before tracks are loaded)
  console.log('[AudioPlayer Component] Render check:', { isInitialized, tracksLength: tracks.length });
  
  if (!isInitialized || tracks.length === 0) {
    console.log('[AudioPlayer Component] Showing loading spinner');
    return (
      <View
        className={cn('p-4 rounded-lg border border-border bg-card', className)}
        style={{ backgroundColor: THEME[theme].card }}
      >
        <ActivityIndicator size="small" />
      </View>
    );
  }
  
  console.log('[AudioPlayer Component] Rendering full player');

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const hasNext = currentTrackIndex !== null && currentTrackIndex < tracks.length - 1;
  const hasPrevious = currentTrackIndex !== null && currentTrackIndex > 0;

  return (
    <View
      className={cn('p-4 rounded-lg border border-border bg-card', className)}
      style={{ backgroundColor: THEME[theme].card }}
    >
      {/* Current Track Info */}
      <View className="mb-4">
        <Text variant="h3" className="mb-1">
          {currentTrack?.title || 'No track selected'}
        </Text>
        {tracks.length > 1 && (
          <Text variant="small" className="text-muted-foreground">
            Track {(currentTrackIndex ?? 0) + 1} of {tracks.length}
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <Slider
          value={progress.position}
          minimumValue={0}
          maximumValue={progress.duration || 1}
          onSlidingComplete={seekTo}
          minimumTrackTintColor={THEME[theme].primary}
          maximumTrackTintColor={THEME[theme].border}
          thumbTintColor={THEME[theme].primary}
          style={{ height: 40 }}
        />
        <View className="flex-row justify-between">
          <Text variant="small" className="text-muted-foreground">
            {formatTime(progress.position)}
          </Text>
          <Text variant="small" className="text-muted-foreground">
            {formatTime(progress.duration)}
          </Text>
        </View>
      </View>

      {/* Main Controls */}
      <View className="flex-row items-center justify-center gap-4 mb-4">
        {/* Skip Backward 5s */}
        <Button
          variant="outline"
          size="icon"
          onPress={() => skipBackward(5)}
          disabled={!isInitialized}
        >
          <View className="relative items-center justify-center">
            <SkipBack size={20} color={THEME[theme].foreground} />
            <Text variant="small" className="absolute text-[10px] font-bold">
              5
            </Text>
          </View>
        </Button>

        {/* Previous Track */}
        <Button
          variant="outline"
          size="icon"
          onPress={previousTrack}
          disabled={!hasPrevious}
        >
          <ChevronLeft size={24} color={THEME[theme].foreground} />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="default"
          size="lg"
          onPress={togglePlayPause}
          disabled={!isInitialized || isLoading}
          className="w-16 h-16 rounded-full"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : isPlaying ? (
            <Pause size={28} color="white" fill="white" />
          ) : (
            <Play size={28} color="white" fill="white" />
          )}
        </Button>

        {/* Next Track */}
        <Button
          variant="outline"
          size="icon"
          onPress={nextTrack}
          disabled={!hasNext}
        >
          <ChevronRight size={24} color={THEME[theme].foreground} />
        </Button>

        {/* Skip Forward 5s */}
        <Button
          variant="outline"
          size="icon"
          onPress={() => skipForward(5)}
          disabled={!isInitialized}
        >
          <View className="relative items-center justify-center">
            <SkipForward size={20} color={THEME[theme].foreground} />
            <Text variant="small" className="absolute text-[10px] font-bold">
              5
            </Text>
          </View>
        </Button>
      </View>

      {/* Secondary Controls */}
      <View className="flex-row items-center justify-between gap-2">
        {/* Skip Backward 3s */}
        <Button
          variant="ghost"
          size="sm"
          onPress={() => skipBackward(3)}
          disabled={!isInitialized}
        >
          <Text variant="small">-3s</Text>
        </Button>

        {/* Playback Speed Selector */}
        <View className="flex-row items-center gap-1">
          {PLAYBACK_SPEEDS.map((speed) => (
            <Pressable
              key={speed}
              onPress={() => setSpeed(speed)}
              className={cn(
                'px-2 py-1 rounded',
                speed === playbackSpeed
                  ? 'bg-primary'
                  : 'bg-secondary'
              )}
              disabled={!isInitialized}
            >
              <Text
                variant="small"
                className={cn(
                  speed === playbackSpeed
                    ? 'text-primary-foreground'
                    : 'text-secondary-foreground'
                )}
              >
                {speed}x
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Skip Forward 3s */}
        <Button
          variant="ghost"
          size="sm"
          onPress={() => skipForward(3)}
          disabled={!isInitialized}
        >
          <Text variant="small">+3s</Text>
        </Button>
      </View>
    </View>
  );
}
