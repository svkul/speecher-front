import { View, Text, StyleSheet, ActivityIndicator, Alert, Pressable } from "react-native";
import { Image } from "expo-image";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";
import { useAuth } from "@/hooks/useAuth";
import { THEME } from "@/libs/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { theme } = useThemeStore();
  const user = useUserStore((state) => state.user);
  const { handleOAuthSignIn, signOut, isLoading } = useAuth();
  
  const handleGoogleSignIn = async () => {
    try {
      const result = await handleOAuthSignIn("google");
      
      if (!result) {
        Alert.alert(
          "Error",
          "Something went wrong. Please try again.",
          [{ text: "OK" }]
        );
        return;
      }

      if (!result.success) {
        Alert.alert(
          "Sign In Failed",
          result.error || "Something went wrong. Please try again.",
          [{ text: "OK" }]
        );
        return;
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      
      if (!result.success) {
        Alert.alert(
          "Sign Out Failed",
          result.error || "Something went wrong. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const renderUserInfo = () => {
    if (!user) return null;

    return (
      <View style={styles.userInfoContainer}>
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: THEME[theme].muted },
            ]}
          >
            <Ionicons
              name="person"
              size={48}
              color={THEME[theme].mutedForeground}
            />
          </View>
        )}

        <View style={styles.userDetails}>
          <Text
            style={[
              styles.userName,
              { color: THEME[theme].fontMain },
            ]}
          >
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.firstName || user.lastName || "User"}
          </Text>
          <Text
            style={[
              styles.userEmail,
              { color: THEME[theme].mutedForeground },
            ]}
          >
            {user.email}
          </Text>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Text
              style={[
                styles.metaLabel,
                { color: THEME[theme].mutedForeground },
              ]}
            >
              Language
            </Text>
            <Text
              style={[styles.metaValue, { color: THEME[theme].fontMain }]}
            >
              {user.language || "Not set"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text
              style={[
                styles.metaLabel,
                { color: THEME[theme].mutedForeground },
              ]}
            >
              Trial Used
            </Text>
            <Text
              style={[styles.metaValue, { color: THEME[theme].fontMain }]}
            >
              {user.trialUsed ? "Yes" : "No"}
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.signOutButton,
            {
              backgroundColor: THEME[theme].button.bg,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleSignOut}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isLoading ? (
            <ActivityIndicator color={THEME[theme].button.text} />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={THEME[theme].button.text}
              />
              <Text
                style={[
                  styles.signOutButtonText,
                  { color: THEME[theme].button.text },
                ]}
              >
                Sign Out
              </Text>
            </>
          )}
        </Pressable>
      </View>
    );
  };

  const renderAuthButton = () => {
    console.log("renderAuthButton: Rendering auth button");
    return (
      <View style={styles.authContainer}>
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={THEME[theme].mutedForeground}
        />
        <Text
          style={[
            styles.authTitle,
            { color: THEME[theme].fontMain },
          ]}
        >
          Sign in to continue
        </Text>

        <Text
          style={[
            styles.authSubtitle,
            { color: THEME[theme].mutedForeground },
          ]}
        >
          Please sign in to view your profile
        </Text>

        <Pressable
          style={[
            styles.signInButton,
            {
              backgroundColor: THEME[theme].button.bg,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={() => {
            handleGoogleSignIn();
          }}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isLoading ? (
            <ActivityIndicator color={THEME[theme].button.text} />
          ) : (
            <>
              <Ionicons
                name="logo-google"
                size={20}
                color={THEME[theme].button.text}
              />
              <Text
                style={[
                  styles.signInButtonText,
                  { color: THEME[theme].button.text },
                ]}
              >
                Sign in with Google {isLoading ? "..." : ""}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    );
  };
  
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: THEME[theme].background },
      ]}
    >
      {user ? renderUserInfo() : renderAuthButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 200,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  userInfoContainer: {
    flex: 1,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    alignItems: "center",
    marginBottom: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
  },
  userMeta: {
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 32,
    alignSelf: "center",
    minWidth: 200,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
