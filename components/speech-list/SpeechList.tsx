import { View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { getSpeeches } from "@/api/speech.service";

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

      {speeches && speeches.map((speech) => (
        <Text key={speech.id}>{speech.title}</Text>
      ))}
    </View>
  );
};