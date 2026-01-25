import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { getSpeeches } from "@/api/speech.service";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";

export const SpeechList = () => {
  const { data: speeches, isLoading, isError, error } = useQuery({
    queryKey: ['speeches'],
    queryFn: getSpeeches,
  });

  return (
    <View>
      <Text>Speech List</Text>

      {isLoading && <Text>Loading...</Text>}

      {isError && <Text>Error loading speeches</Text>}

      {speeches && (
        <View className="mb-2">
          {speeches.map((speech) => (
            <Button
              key={speech.id}
              onPress={() => router.push(`/speech/${speech.id}`)}
              className="mb-2"
            >
              <Text>{speech.title}</Text>
            </Button>
          ))}
        </View>
      )}

      <Button onPress={() => router.push("/speech/create")}>
        <Text>Add new speech</Text>
      </Button>
    </View>
  );
};