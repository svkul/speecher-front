import { UserResponse } from "@/api/types";
import { create } from "zustand";

interface UserData {
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
}

interface UserStore extends UserData {
  // Actions
  setUser: (user: UserData["user"]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;

  // Computed/helper methods
  isAuthenticated: () => boolean;
  setIsAuthModalOpen: (isAuthModalOpen: boolean) => void;
}

const initialState: UserData = {
  user: null,
  isLoading: false,
  error: null,
  isAuthModalOpen: false,
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  setUser: (user: UserResponse | null) => {
    const currentUser = get().user;

    if (!user && !currentUser) return;

    set({ user, error: null });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearUser: () => set(initialState),

  isAuthenticated: () => {
    const state = get();
    return !!state.user;
  },

  setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
}));
