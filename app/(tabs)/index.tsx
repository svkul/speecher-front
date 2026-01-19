import { View, Text, StyleSheet } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { THEME } from "@/libs/theme";

export default function HomeScreen() {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: THEME[theme].background },
      ]}
    >
      <Text style={[styles.title, { color: THEME[theme].fontMain }]}>
        Welcome to Speecher
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
