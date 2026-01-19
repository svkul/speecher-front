import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>

      <Pressable onPress={() => router.push("/(tabs)/profile")}>
        <Text style={{ color: "blue", marginTop: 10 }}>Go to Profile</Text>
      </Pressable>
    </View>
  );
}
