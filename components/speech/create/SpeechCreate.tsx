import { View, ScrollView, Alert } from "react-native";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { AxiosError } from "axios";

import {
  createSpeech,
  getTtsLanguages,
  getTtsVoices,
  getTtsModels,
} from "@/api/speech.service";
import { CreateSpeechDto, AppErrorResponse } from "@/api/types";

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
import { useThemeStore } from "@/store/themeStore";
import { THEME } from "@/libs/theme";

interface SpeechBlockForm {
  title: string;
  text: string;
  ttsLanguage?: string;
  ttsVoice?: string;
  ttsModel?: string;
  ttsStyle?: string;
}

interface SpeechForm {
  title: string;
  blocks: SpeechBlockForm[];
}

interface BlockTtsFieldsProps {
  control: any;
  index: number;
  language?: string;
  errors: any;
  setValue: <T extends keyof SpeechForm>(
    name: T | `blocks.${number}` | `blocks.${number}.title` | `blocks.${number}.text` | `blocks.${number}.ttsLanguage` | `blocks.${number}.ttsVoice` | `blocks.${number}.ttsModel` | `blocks.${number}.ttsStyle`,
    value: any,
  ) => void;
}

/**
 * Component for TTS fields (language, voice, model) for a speech block
 */
const BlockTtsFields = ({
  control,
  index,
  language,
  errors,
  setValue,
}: BlockTtsFieldsProps) => {
  // Fetch voices for the selected language
  const { data: voicesData } = useQuery({
    queryKey: ["tts", "voices", language],
    queryFn: () => getTtsVoices(language),
    enabled: !!language,
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

  const handleLanguageChange = (option: Option | undefined) => {
    if (!option) return;
    const newLanguage = option.value;
    setValue(`blocks.${index}.ttsLanguage` as any, newLanguage);
    // Reset voice when language changes
    if (newLanguage !== language) {
      setValue(`blocks.${index}.ttsVoice` as any, undefined);
    }
  };

  return (
    <>
      <View className="mb-3">
        <Text className="mb-2 text-sm text-muted-foreground">
          TTS Language (optional)
        </Text>
        <Controller
          control={control}
          name={`blocks.${index}.ttsLanguage`}
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
          name={`blocks.${index}.ttsVoice`}
          render={({ field: { onChange, value } }) => (
            <Select
              value={value || undefined}
              onValueChange={(option: Option | undefined) => {
                if (option) onChange(option.value);
              }}
              disabled={!language}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    language
                      ? "Select voice"
                      : "Select language first"
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
          name={`blocks.${index}.ttsModel`}
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
    </>
  );
};

export const SpeechCreate = () => {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SpeechForm>({
    defaultValues: {
      title: "",
      blocks: [
        {
          title: "",
          text: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "blocks",
  });

  // Watch all block languages to fetch voices when language changes
  const watchedBlocks = watch("blocks");

  const mutation = useMutation({
    mutationFn: createSpeech,
    onSuccess: (data) => {
      // Invalidate and refetch speeches list
      queryClient.invalidateQueries({ queryKey: ["speeches"] });
      // Navigate to the created speech detail page
      router.replace(`/speech/${data.id}`);
    },
    onError: (error: AxiosError<AppErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create speech";
      Alert.alert("Error", errorMessage);
    },
  });

  const onSubmit = (data: SpeechForm) => {
    // Transform form data to API format
    const createSpeechDto: CreateSpeechDto = {
      title: data.title,
      blocks: data.blocks.map((block, index) => ({
        title: block.title,
        text: block.text,
        order: index + 1,
        ...(block.ttsLanguage && { ttsLanguage: block.ttsLanguage }),
        ...(block.ttsVoice && { ttsVoice: block.ttsVoice }),
        ...(block.ttsModel && { ttsModel: block.ttsModel }),
        ...(block.ttsStyle && { ttsStyle: block.ttsStyle }),
      })),
    };

    mutation.mutate(createSpeechDto);
  };

  const addBlock = () => {
    append({
      title: "",
      text: "",
    });
  };

  const removeBlock = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      Alert.alert("Warning", "At least one block is required");
    }
  };

  return (
    <ScrollView
      className="flex-1 p-4"
      style={{ backgroundColor: THEME[theme].background }}
    >
      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold">Create Speech</Text>
        <Text className="mb-4 text-sm text-muted-foreground">
          Fill in the form below to create a new speech with blocks
        </Text>
      </View>

      <View className="mb-6">
        <Text className="mb-2 font-medium">Title</Text>
        <Controller
          control={control}
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
        {errors.title && (
          <Text className="mt-1 text-sm text-destructive">
            {errors.title.message}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-medium">Blocks</Text>
          <Button onPress={addBlock} variant="outline" size="sm">
            <Text>Add Block</Text>
          </Button>
        </View>

        {fields.map((field, index) => (
          <View
            key={field.id}
            className="mb-4 rounded-lg border border-border bg-card p-4"
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-medium">Block {index + 1}</Text>
              {fields.length > 1 && (
                <Button
                  onPress={() => removeBlock(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Text>Remove</Text>
                </Button>
              )}
            </View>

            <View className="mb-3">
              <Text className="mb-2 text-sm">Block Title</Text>
              <Controller
                control={control}
                name={`blocks.${index}.title`}
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
              {errors.blocks?.[index]?.title && (
                <Text className="mt-1 text-sm text-destructive">
                  {errors.blocks[index]?.title?.message}
                </Text>
              )}
            </View>

            <View className="mb-3">
              <Text className="mb-2 text-sm">Block Text</Text>
              <Controller
                control={control}
                name={`blocks.${index}.text`}
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
              {errors.blocks?.[index]?.text && (
                <Text className="mt-1 text-sm text-destructive">
                  {errors.blocks[index]?.text?.message}
                </Text>
              )}
            </View>

            <BlockTtsFields
              control={control}
              index={index}
              language={watchedBlocks[index]?.ttsLanguage}
              errors={errors}
              setValue={setValue}
            />

            <View>
              <Text className="mb-2 text-sm text-muted-foreground">
                TTS Style (optional)
              </Text>
              <Controller
                control={control}
                name={`blocks.${index}.ttsStyle`}
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
          </View>
        ))}

        {errors.blocks && typeof errors.blocks === "object" && (
          <Text className="mt-1 text-sm text-destructive">
            Please fill in all required block fields
          </Text>
        )}
      </View>

      <View className="mb-4 flex-row gap-2">
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || mutation.isPending}
          className="flex-1"
        >
          <Text>
            {isSubmitting || mutation.isPending ? "Creating..." : "Create Speech"}
          </Text>
        </Button>
        <Button
          onPress={() => router.back()}
          variant="outline"
          disabled={isSubmitting || mutation.isPending}
        >
          <Text>Cancel</Text>
        </Button>
      </View>
    </ScrollView>
  );
};
