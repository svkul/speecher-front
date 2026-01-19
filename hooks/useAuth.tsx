import { useState } from "react";
import { Platform } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { AxiosError } from "axios";

import {
  clearTokens,
  getTokens,
  hasValidTokens,
  saveTokens,
} from "@/store/authStorage";
import { signInWithOAuth, signOut, OAuthProvider } from "@/api/auth.service";
import { AppErrorResponse } from "@/api/types";
import { useUserStore } from "@/store/userStore";
import { config } from "@/config";

// Configure WebBrowser for OAuth completion
WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  // User store actions (only for setting user after auth)
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const user = useUserStore((state) => state.user);

  // ============================================
  // OAuth sign in with Google or Apple
  // ============================================

  /**
   * OAuth sign in with Google or Apple
   */
  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    try {
      setIsLoading(true);
      console.log(`handleOAuthSignIn: Starting ${provider} sign in on ${Platform.OS}`);

      if (provider === "google") {
        if (Platform.OS === "ios") {
          console.log("handleOAuthSignIn: Using iOS Google sign in");
          return await signInWithGoogleIOS();
        } else if (Platform.OS === "android") {
          console.log("handleOAuthSignIn: Using Android Google sign in");
          return await signInWithGoogleAndroid();
        } else if (Platform.OS === "web") {
          console.log("handleOAuthSignIn: Using Web Google sign in");
          return await signInWithGoogleWeb();
        } else {
          console.error("handleOAuthSignIn: Unsupported platform:", Platform.OS);
          return {
            success: false,
            error: "Unsupported platform for Google OAuth",
          };
        }
      }

      if (provider === "apple") {
        console.log("handleOAuthSignIn: Using Apple sign in");
        return await signInWithApple();
      }

      console.error("handleOAuthSignIn: Unsupported provider:", provider);
      return { success: false, error: "Unsupported OAuth provider" };
    } catch (error: any) {
      console.error("handleOAuthSignIn: Unexpected error:", error);
      return {
        success: false,
        error: error?.message || "Failed to sign in with OAuth",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Google OAuth
  // ============================================

  /**
   * Sign in with Google OAuth - iOS version
   * Uses native Google Sign-In SDK
   */
  const signInWithGoogleIOS = async () => {
    const iosClientId = config.oauth.google.clientIdIos;
    const webClientId = config.oauth.google.clientIdWeb;

    if (!iosClientId || !webClientId) {
      return {
        success: false,
        error:
          "Google OAuth not configured for iOS. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS and EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB",
      };
    }

    try {
      GoogleSignin.configure({
        iosClientId: iosClientId,
        webClientId: webClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });

      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore sign out errors
      }

      const signInResult = await GoogleSignin.signIn();

      const resultData = (signInResult as any)?.data;
      if (!signInResult || !resultData || !resultData.user) {
        try {
          await GoogleSignin.signOut();
        } catch {
          // Ignore sign out errors
        }

        return {
          success: false,
          error: "Sign in cancelled",
        };
      }

      // Only get tokens if sign-in was successful (signInResult contains user data)
      const tokens = await GoogleSignin.getTokens();

      // Verify that we have a valid ID token
      // If no ID token, it means sign in was cancelled or failed
      if (!tokens || !tokens.idToken) {
        // Sign out from Google to clear session when token is missing
        try {
          await GoogleSignin.signOut();
        } catch {
          // Ignore sign out errors
        }

        return {
          success: false,
          error: "Sign in cancelled",
        };
      }

      return await verifyAndSaveOAuthToken(tokens.idToken);
    } catch (error: any) {
      console.error("Google OAuth iOS error:", error);

      // If user cancelled, sign out from Google to clear session
      // This allows user to select different account on next attempt
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === "SIGN_IN_CANCELLED"
      ) {
        try {
          await GoogleSignin.signOut();
        } catch {
          // Ignore sign out errors
        }
      }

      return handleGoogleSignInError(error, "ios");
    }
  };

  /**
   * Sign in with Google OAuth - Android version
   * Uses native Google Sign-In SDK
   */
  const signInWithGoogleAndroid = async () => {
    const webClientId = config.oauth.google.clientIdWeb;

    if (!webClientId) {
      return {
        success: false,
        error:
          "Google OAuth not configured for Android. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB",
      };
    }

    try {
      // Configure Google Sign-In
      // webClientId is required to get ID token that can be verified by backend
      GoogleSignin.configure({
        webClientId: webClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });

      await GoogleSignin.hasPlayServices();

      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore sign out errors
      }

      const signInResult = await GoogleSignin.signIn();

      const resultData = (signInResult as any)?.data;
      if (!signInResult || !resultData || !resultData.user) {
        try {
          await GoogleSignin.signOut();
        } catch {
          // Ignore sign out errors
        }

        return {
          success: false,
          error: "Sign in cancelled",
        };
      }

      // Only get tokens if sign-in was successful (signInResult contains user data)
      const tokens = await GoogleSignin.getTokens();

      // Verify that we have a valid ID token
      // If no ID token, it means sign in was cancelled or failed
      if (!tokens || !tokens.idToken) {
        // Sign out from Google to clear session when token is missing
        try {
          await GoogleSignin.signOut();
        } catch {
          // Ignore sign out errors
        }

        return {
          success: false,
          error: "Sign in cancelled",
        };
      }

      return await verifyAndSaveOAuthToken(tokens.idToken);
    } catch (error: any) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === "SIGN_IN_CANCELLED"
      ) {
        try {
          await GoogleSignin.signOut();
        } catch {
          // Ignore sign out errors
        }
      }

      return handleGoogleSignInError(error, "android");
    }
  };

  /**
   * Handle Google Sign-In errors and return user-friendly messages
   */
  const handleGoogleSignInError = (error: any, platform: "ios" | "android") => {
    // Check for cancellation using statusCodes constant
    if (
      error.code === statusCodes.SIGN_IN_CANCELLED ||
      error.code === "SIGN_IN_CANCELLED"
    ) {
      return {
        success: false,
        error: "Sign in cancelled",
      };
    }

    if (
      error.code === statusCodes.IN_PROGRESS ||
      error.code === "IN_PROGRESS"
    ) {
      return {
        success: false,
        error: "Sign in already in progress",
      };
    }

    if (
      platform === "android" &&
      (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE ||
        error.code === "PLAY_SERVICES_NOT_AVAILABLE")
    ) {
      return {
        success: false,
        error: "Google Play Services not available",
      };
    }

    return {
      success: false,
      error: error.message || `Failed to sign in with Google on ${platform}`,
    };
  };

  /**
   * Sign in with Google OAuth - Web version
   * Uses expo-auth-session with implicit flow (gets id_token directly)
   * Note: Implicit flow is used because Authorization Code flow requires client_secret
   * which cannot be safely stored in client-side code
   */
  const signInWithGoogleWeb = async () => {
    const webClientId = config.oauth.google.clientIdWeb;

    if (!webClientId) {
      return {
        success: false,
        error:
          "Google OAuth not configured for Web. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB",
      };
    }

    try {
      // Configure OAuth request with implicit flow (no client_secret needed)
      const redirectUri = AuthSession.makeRedirectUri();

      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      };

      // Create request for implicit flow
      // This gets id_token directly without code exchange
      const request = new AuthSession.AuthRequest({
        clientId: webClientId,
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        scopes: ["openid", "profile", "email"],
        usePKCE: false, // Explicitly disable PKCE for implicit flow
        extraParams: {
          // Force account selection to allow switching accounts
          prompt: "select_account",
          // Use nonce for security in implicit flow
          nonce: Math.random().toString(36).substring(2, 15),
        },
      });

      // Prompt for authentication
      const result = await request.promptAsync(discovery);

      if (result.type === "cancel" || result.type === "dismiss") {
        return {
          success: false,
          error: "Sign in cancelled",
        };
      }

      if (result.type === "error") {
        return {
          success: false,
          error: result.error?.message || "Failed to sign in with Google",
        };
      }

      if (result.type === "success") {
        const idToken = result.params.id_token;

        if (!idToken) {
          return {
            success: false,
            error: "Failed to get ID token from Google",
          };
        }

        return await verifyAndSaveOAuthToken(idToken);
      }

      return {
        success: false,
        error: "Unexpected OAuth result",
      };
    } catch (error: any) {
      console.error("signInWithGoogleWeb error:", error);
      return {
        success: false,
        error: error?.message || "Failed to sign in with Google on web",
      };
    }
  };

  /**
   * Verify OAuth ID token with backend and save tokens/user
   * Common logic for both iOS and Android Google OAuth flows
   * For web: tokens are in httpOnly cookies, so they will be empty in response
   * For mobile: tokens are returned in response and saved to storage
   */
  const verifyAndSaveOAuthToken = async (idToken: string) => {
    if (!idToken) {
      console.error("verifyAndSaveOAuthToken: No ID token provided");
      return {
        success: false,
        error: "Failed to get ID token from Google",
      };
    }

    try {
      console.log("verifyAndSaveOAuthToken: Verifying token with backend...");
      // Send ID Token to backend for verification
      // Backend will verify token, create/find user, and return OUR JWT tokens (or empty for web)
      const authData = await signInWithOAuth(OAuthProvider.GOOGLE, idToken);
      console.log("verifyAndSaveOAuthToken: Backend response received", {
        hasUser: !!authData.user,
        hasAccessToken: !!authData.accessToken,
        hasRefreshToken: !!authData.refreshToken,
        platform: Platform.OS,
      });

      // For web: tokens are empty (in httpOnly cookies), for mobile: tokens in response
      // saveTokens handles this internally - on web it does nothing, on mobile it saves to storage
      if (
        Platform.OS !== "web" &&
        (!authData.accessToken || !authData.refreshToken)
      ) {
        console.error("verifyAndSaveOAuthToken: Missing tokens for mobile platform");
        return {
          success: false,
          error: "Failed to get tokens from backend",
        };
      }

      // Save OUR JWT tokens (from backend) to secure storage (mobile only)
      saveTokens({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });
      console.log("verifyAndSaveOAuthToken: Tokens saved");

      // Save user to store
      if (authData.user) {
        setUser(authData.user);
        console.log("verifyAndSaveOAuthToken: User saved to store");
      }

      return {
        success: true,
        user: authData.user,
      };
    } catch (error: any) {
      console.error("verifyAndSaveOAuthToken: Error:", error);
      // Handle Axios errors
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data as AppErrorResponse;
        console.error("verifyAndSaveOAuthToken: Axios error response:", errorData);
        return {
          success: false,
          error: errorData.message || "Failed to verify OAuth token",
        };
      }

      return {
        success: false,
        error: error?.message || "Failed to verify OAuth token",
      };
    }
  };

  // ============================================
  // Apple OAuth
  // ============================================

  const signInWithApple = async () => {
    return {
      success: false,
      error: "Apple OAuth not implemented yet",
    };
  };

  // ============================================
  // Sign out
  // ============================================

  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      try {
        await signOut();
      } catch (signOutError: any) {
        // If sign out fails on backend, still clear local state
        console.warn("Backend sign out error (non-critical):", signOutError);
      }

      try {
        await GoogleSignin.signOut();
      } catch (googleError: any) {
        console.warn(
          "Google sign out error (non-critical):",
          googleError?.message || googleError
        );
      }

      await clearAuth();

      return { success: true };
    } catch (error: any) {
      try {
        await clearAuth();
      } catch (clearError: any) {
        console.warn(
          "Error clearing auth state:",
          clearError?.message || clearError
        );
      }

      return {
        success: false,
        error: error.message || "Failed to sign out",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = async () => {
    clearTokens();
    clearUser();
  };

  const isAuthenticatedCheck = () => {
    return hasValidTokens();
  };

  const getCurrentTokens = () => {
    return getTokens();
  };

  return {
    isLoading,
    user,

    // OAuth sign in
    handleOAuthSignIn,

    // Sign out
    signOut: handleSignOut,
    clearAuth,
    isAuthenticated: isAuthenticatedCheck,
    getCurrentTokens,
  };
};
