import { View, Text } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { THEME } from "@/libs/theme";
import { SpeechList } from "@/components/speech-list/SpeechList";

export default function HomeScreen() {
  const { theme } = useThemeStore();

  return (
    <View
    className="flex-1 justify-center items-center p-4 bg-background"
      style={[
        { backgroundColor: THEME[theme].background },
      ]}
    >
      <Text className="text-2xl font-bold text-primary mb-2">
        Welcome to Speecher
      </Text>

      <SpeechList />
    </View>
  );
}
