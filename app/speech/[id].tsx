import { View, ScrollView, Alert, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { AxiosError } from "axios";

import { useThemeStore } from "@/store/themeStore";
import { THEME } from "@/libs/theme";
import {
  getSpeech,
  updateSpeech,
  generateAudio,
} from "@/api/speech.service";
import { UpdateSpeechDto, AppErrorResponse } from "@/api/types";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpeechBlockEdit } from "@/components/speech/edit/SpeechBlockEdit";
import { AudioPlayer } from "@/components/audio/AudioPlayer";

export default function SpeechDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { data: speech, isLoading, isError } = useQuery({
    queryKey: ["speech", id],
    queryFn: () => getSpeech(id!),
    enabled: !!id,
  });

  const {
    control: titleControl,
    handleSubmit: handleTitleSubmit,
    reset: resetTitleForm,
    formState: { isSubmitting: isTitleSubmitting },
  } = useForm<UpdateSpeechDto>({
    defaultValues: {
      title: speech?.title || "",
    },
  });

  // Update form when speech loads
  useEffect(() => {
    if (speech) {
      resetTitleForm({ title: speech.title });
    }
  }, [speech, resetTitleForm]);

  const updateTitleMutation = useMutation({
    mutationFn: (data: UpdateSpeechDto) => updateSpeech(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["speech", id] });
      queryClient.invalidateQueries({ queryKey: ["speeches"] });
      setIsEditingTitle(false);
    },
    onError: (error: AxiosError<AppErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update speech";
      Alert.alert("Error", errorMessage);
    },
  });

  const generateAudioMutation = useMutation({
    mutationFn: () => generateAudio(id!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["speech", id] });
      queryClient.invalidateQueries({ queryKey: ["speeches"] });
      Alert.alert(
        "Success",
        `Audio generated: ${data.successCount} success, ${data.failureCount} failures`,
      );
    },
    onError: (error: AxiosError<AppErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to generate audio";
      Alert.alert("Error", errorMessage);
    },
  });

  const openAudioUrl = async (audioUrl: string) => {
    try {
      const canOpen = await Linking.canOpenURL(audioUrl);
      if (canOpen) {
        await Linking.openURL(audioUrl);
      } else {
        Alert.alert("Error", "Cannot open audio URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open audio");
    }
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ backgroundColor: THEME[theme].background }}
      >
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading...</Text>
      </View>
    );
  }

  if (isError || !speech) {
    return (
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ backgroundColor: THEME[theme].background }}
      >
        <Text>Error loading speech</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 p-4"
      style={{ backgroundColor: THEME[theme].background }}
    >
      <View className="mb-4">
        {!isEditingTitle ? (
          <View className="flex-row items-center justify-between">
            <Text variant="h1" className="flex-1">
              {speech.title}
            </Text>
            <Button
              onPress={() => setIsEditingTitle(true)}
              variant="outline"
              size="sm"
            >
              <Text>Edit</Text>
            </Button>
          </View>
        ) : (
          <View>
            <Controller
              control={titleControl}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter speech title"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            <View className="mt-2 flex-row gap-2">
              <Button
                onPress={handleTitleSubmit((data) => {
                  updateTitleMutation.mutate(data);
                })}
                disabled={isTitleSubmitting || updateTitleMutation.isPending}
                className="flex-1"
              >
                <Text>
                  {isTitleSubmitting || updateTitleMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </Text>
              </Button>
              <Button
                onPress={() => setIsEditingTitle(false)}
                variant="outline"
                disabled={isTitleSubmitting || updateTitleMutation.isPending}
              >
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        )}
      </View>

      <View className="mb-4">
        <Button
          onPress={() => generateAudioMutation.mutate()}
          disabled={generateAudioMutation.isPending}
        >
          {generateAudioMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text>Generate Audio for All Blocks</Text>
          )}
        </Button>
      </View>

      {/* Audio Player */}
      {speech.blocks && speech.blocks.some(block => block.audioUrl) && (
        <View className="mb-4">
          <AudioPlayer blocks={speech.blocks} />
        </View>
      )}

      {speech.blocks && speech.blocks.length > 0 ? (
        <View className="space-y-4">
          {speech.blocks.map((block) => (
            <View key={block.id}>
              <SpeechBlockEdit block={block} speechId={speech.id} />
              {block.audioUrl && (
                <View className="mt-2">
                  <Button
                    onPress={() => openAudioUrl(block.audioUrl!)}
                    variant="outline"
                    size="sm"
                  >
                    <Text>Open Audio</Text>
                  </Button>
                  {block.duration && (
                    <Text variant="small" className="text-muted-foreground mt-1">
                      Duration: {Math.round(block.duration)}s
                      {block.charactersUsed &&
                        ` • Characters: ${block.charactersUsed}`}
                    </Text>
                  )}
                  {block.generatedAt && (
                    <Text variant="small" className="text-muted-foreground">
                      Generated: {new Date(block.generatedAt).toLocaleString()}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-muted-foreground">No blocks yet</Text>
      )}

      <View className="mt-4">
        <Button onPress={() => router.back()} variant="outline">
          <Text>Go Back</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
