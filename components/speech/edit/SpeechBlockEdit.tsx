import { View, Alert } from "react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { updateSpeechBlock, getTtsLanguages, getTtsVoices, getTtsModels } from "@/api/speech.service";
import { UpdateSpeechBlockDto, AppErrorResponse, SpeechBlockResponse } from "@/api/types";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  NativeSelectScrollView,
  type Option,
} from "@/components/ui/select";

interface SpeechBlockEditProps {
  block: SpeechBlockResponse;
  speechId: string;
  onCancel?: () => void;
}

export const SpeechBlockEdit = ({
  block,
  speechId,
  onCancel,
}: SpeechBlockEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSpeechBlockDto>({
    defaultValues: {
      title: block.title,
      text: block.text,
      ttsLanguage: block.ttsLanguage || undefined,
      ttsVoice: block.ttsVoice || undefined,
      ttsModel: block.ttsModel || undefined,
      ttsStyle: block.ttsStyle || undefined,
    },
  });

  const watchedLanguage = watch("ttsLanguage");

  // Fetch voices for the selected language
  const { data: voicesData } = useQuery({
    queryKey: ["tts", "voices", watchedLanguage],
    queryFn: () => getTtsVoices(watchedLanguage),
    enabled: !!watchedLanguage,
  });

  // Fetch languages and models
  const { data: languagesData } = useQuery({
    queryKey: ["tts", "languages"],
    queryFn: () => getTtsLanguages(),
  });

  const { data: modelsData } = useQuery({
    queryKey: ["tts", "models"],
    queryFn: () => getTtsModels(),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateSpeechBlockDto) =>
      updateSpeechBlock(block.id, data),
    onSuccess: () => {
      // Invalidate and refetch speech data
      queryClient.invalidateQueries({ queryKey: ["speech", speechId] });
      queryClient.invalidateQueries({ queryKey: ["speeches"] });
      setIsEditing(false);
      if (onCancel) onCancel();
    },
    onError: (error: AxiosError<AppErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update block";
      Alert.alert("Error", errorMessage);
    },
  });

  const onSubmit = (data: UpdateSpeechBlockDto) => {
    mutation.mutate(data);
  };

  const handleLanguageChange = (option: Option | undefined) => {
    if (!option) return;
    const newLanguage = option.value;
    setValue("ttsLanguage", newLanguage);
    // Reset voice when language changes
    if (newLanguage !== watchedLanguage) {
      setValue("ttsVoice", undefined);
    }
  };

  if (!isEditing) {
    return (
      <View className="mb-4 rounded-lg border border-border bg-card p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text variant="h3" className="mb-2">
            {block.title}
          </Text>
          <Button onPress={() => setIsEditing(true)} variant="outline" size="sm">
            <Text>Edit</Text>
          </Button>
        </View>
        <Text className="mb-2">{block.text}</Text>

        {block.audioUrl && (
          <View className="mt-2">
            <Text variant="small" className="text-muted-foreground">
              Audio available
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-lg border border-border bg-card p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text variant="h3" className="mb-2">
          Edit Block
        </Text>

        <Button
          onPress={() => {
            setIsEditing(false);
            if (onCancel) onCancel();
          }}
          variant="outline"
          size="sm"
        >
          <Text>Cancel</Text>
        </Button>
      </View>

      <View className="mb-3">
        <Text className="mb-2 text-sm">Block Title</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: "Block title is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter block title"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />

        {errors.title && (
          <Text className="mt-1 text-sm text-destructive">
            {errors.title.message}
          </Text>
        )}
      </View>

      <View className="mb-3">
        <Text className="mb-2 text-sm">Block Text</Text>

        <Controller
          control={control}
          name="text"
          rules={{ required: "Block text is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              placeholder="Enter block text"
              numberOfLines={4}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />

        {errors.text && (
          <Text className="mt-1 text-sm text-destructive">
            {errors.text.message}
          </Text>
        )}
      </View>

      <View className="mb-3">
        <Text className="mb-2 text-sm text-muted-foreground">
          TTS Language (optional)
        </Text>

        <Controller
          control={control}
          name="ttsLanguage"
          render={({ field: { value } }) => (
            <Select
              value={value || undefined}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <NativeSelectScrollView>
                  {languagesData?.languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} label={lang.name}>
                      <Text>{lang.name}</Text>
                    </SelectItem>
                  ))}
                </NativeSelectScrollView>
              </SelectContent>
            </Select>
          )}
        />
      </View>

      <View className="mb-3">
        <Text className="mb-2 text-sm text-muted-foreground">
          TTS Voice (optional)
        </Text>
        <Controller
          control={control}
          name="ttsVoice"
          render={({ field: { onChange, value } }) => (
            <Select
              value={value || undefined}
              onValueChange={(option: Option | undefined) => {
                if (option) onChange(option.value);
              }}
              disabled={!watchedLanguage}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    watchedLanguage ? "Select voice" : "Select language first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <NativeSelectScrollView>
                  {voicesData?.voices.map((voice) => (
                    <SelectItem
                      key={voice.name}
                      value={voice.name}
                      label={`${voice.name} (${voice.ssmlGender})`}
                    >
                      <Text>
                        {voice.name} ({voice.ssmlGender})
                      </Text>
                    </SelectItem>
                  ))}
                </NativeSelectScrollView>
              </SelectContent>
            </Select>
          )}
        />
      </View>

      <View className="mb-3">
        <Text className="mb-2 text-sm text-muted-foreground">
          TTS Model (optional)
        </Text>
        <Controller
          control={control}
          name="ttsModel"
          render={({ field: { onChange, value } }) => (
            <Select
              value={value || undefined}
              onValueChange={(option: Option | undefined) => {
                if (option) onChange(option.value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <NativeSelectScrollView>
                  {modelsData?.models.map((model) => {
                    const label = `${model.name}${model.name === modelsData.recommendedModel ? " (Recommended)" : ""}`;
                    return (
                      <SelectItem key={model.name} value={model.name} label={label}>
                        <Text>{label}</Text>
                      </SelectItem>
                    );
                  })}
                </NativeSelectScrollView>
              </SelectContent>
            </Select>
          )}
        />
      </View>

      <View className="mb-3">
        <Text className="mb-2 text-sm text-muted-foreground">
          TTS Style (optional)
        </Text>
        <Controller
          control={control}
          name="ttsStyle"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              placeholder="SSML or style instructions"
              numberOfLines={2}
              value={value || ""}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View className="flex-row gap-2">
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || mutation.isPending}
          className="flex-1"
        >
          <Text>
            {isSubmitting || mutation.isPending ? "Saving..." : "Save"}
          </Text>
        </Button>
        <Button
          onPress={() => {
            setIsEditing(false);
            if (onCancel) onCancel();
          }}
          variant="outline"
          disabled={isSubmitting || mutation.isPending}
        >
          <Text>Cancel</Text>
        </Button>
      </View>
    </View>
  );
};
