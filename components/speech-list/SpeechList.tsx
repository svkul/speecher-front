import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { getSpeeches } from "@/api/speech.service";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export const SpeechList = () => {
  const { data: speeches, isLoading, isError } = useQuery({
    queryKey: ['speeches'],
    queryFn: getSpeeches,
  });

  return (
    <View>
      <Text>Speech List</Text>

      {isLoading && <Text>Loading...</Text>}

      {isError && <Text>Error: {isError.message}</Text>}

      {speeches && (
        <View className="mb-2">
          {speeches.map((speech) => (
            <View key={speech.id}>
              <Text>{speech.title}</Text>
            </View>
          ))}
        </View>
      )}

      <Button>
        <Text>Add new speech</Text>
      </Button>
    </View>
  );
};