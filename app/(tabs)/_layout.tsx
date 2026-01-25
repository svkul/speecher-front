import { Tabs } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { THEME } from "@/libs/theme";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const { theme } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME[theme].primary,
        tabBarInactiveTintColor: THEME[theme].mutedForeground,
        tabBarStyle: {
          backgroundColor: THEME[theme].card,
          borderTopColor: THEME[theme].border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Speeches",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
