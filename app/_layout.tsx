import { useUserSync } from "@/hooks/useUserSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

import i18n from "@/libs/i18n/i18n.config";
import { THEME } from "@/libs/theme";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";

export default function RootLayout() {
  // Create a client
const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <UserSyncWrapper />
      <SafeAreaProviderWrapper />
    </QueryClientProvider>
  );
}

function UserSyncWrapper() {
  // useAuth now handles user sync automatically
  useUserSync();
  return null;
}

function SafeAreaProviderWrapper() {
  const { theme: savedTheme } = useThemeStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    // Set system UI theme based on saved theme
    SystemUI.setBackgroundColorAsync(
      THEME[savedTheme].background
    );
  }, [savedTheme]);

  useEffect(() => {
    // Sync language with i18next
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const statusBarStyle = savedTheme === "dark" ? "light" : "dark";

  return (
    <SafeAreaProvider style={{ backgroundColor: THEME[savedTheme].background }}>
      <StatusBar style={statusBarStyle} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME[savedTheme].background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        {/* <Stack.Screen name="auth" /> */}
      </Stack>

      {/* <PortalHost /> */}
      {/* <AuthModal /> */}
      {/* <Toast position="top" /> */}
    </SafeAreaProvider>
  );
}

