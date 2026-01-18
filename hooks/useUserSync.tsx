import { useEffect } from "react";
import { Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getCurrentUser } from "@/api/user.service";
import { AppErrorResponse } from "@/api/types";
import { hasValidTokens } from "@/store/authStorage";
import { useUserStore } from "@/store/userStore";

/**
 * Hook for syncing user data from backend
 * Should be called only once at the app root level (_layout.tsx)
 *
 * For web: Always attempts to fetch user data (tokens in httpOnly cookies)
 * For mobile: Only fetches if tokens exist in storage
 */
export const useUserSync = () => {
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);
  const setError = useUserStore((state) => state.setError);
  const clearUser = useUserStore((state) => state.clearUser);

  // On web: always try to fetch (tokens in httpOnly cookies)
  // On mobile: only if tokens exist in storage
  const isAuthenticated = Platform.OS === "web" ? true : hasValidTokens();

  const {
    data: userProfile,
    isLoading: userProfileLoading,
    error: userProfileError,
  } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 401 (Unauthorized)
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  // Sync user data to store
  useEffect(() => {
    setLoading(userProfileLoading);
    
    // Extract error message from AxiosError
    if (userProfileError) {
      if (userProfileError instanceof AxiosError && userProfileError.response) {
        const errorData = userProfileError.response.data as AppErrorResponse;
        setError(errorData.message ?? userProfileError.message);
      } else {
        setError(userProfileError.message ?? "Failed to load user");
      }
    } else {
      setError(null);
    }

    // On web: always try to use user data from backend (tokens in httpOnly cookies)
    // On mobile: check if tokens exist in storage
    const currentAuthStatus = Platform.OS === "web" ? true : hasValidTokens();

    // If user data is successfully loaded, save it
    if (userProfile) {
      setUser(userProfile);
    }
    // If there's an error (e.g., UNAUTHORIZED), clear user
    else if (userProfileError) {
      // Only clear user on 401 (Unauthorized) or if it's a network error
      if (
        userProfileError instanceof AxiosError &&
        (userProfileError.response?.status === 401 ||
          !userProfileError.response)
      ) {
        clearUser();
      }
    }
    // On mobile: if no tokens, clear user
    else if (!currentAuthStatus) {
      clearUser();
    }
  }, [
    userProfile,
    isAuthenticated,
    userProfileLoading,
    userProfileError,
    setUser,
    setLoading,
    setError,
    clearUser,
  ]);
};
