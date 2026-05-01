"use client";

import { create } from "zustand";
import type { User } from "@/types/api";

export type RecommendationPreferences = {
  interests: string[];
  exams: string[];
  preferredLocation: string;
  preferredStates: string[];
  preferredCollegeIds: number[];
  budget: "low" | "medium" | "high";
  studyMode: "campus" | "online" | "hybrid";
};

type AuthStore = {
  user: User | null;
  savedCollegeIds: number[];
  isAuthModalOpen: boolean;
  isRecommendationFlowOpen: boolean;
  authMode: "login" | "register";
  redirectPath: string | null;
  recommendationPreferences: RecommendationPreferences | null;
  setUser: (user: User | null) => void;
  setSavedCollegeIds: (ids: number[]) => void;
  addSavedCollegeId: (id: number) => void;
  removeSavedCollegeId: (id: number) => void;
  openAuthModal: (mode?: "login" | "register", redirectPath?: string | null) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: "login" | "register") => void;
  openRecommendationFlow: () => void;
  closeRecommendationFlow: () => void;
  setRecommendationPreferences: (preferences: RecommendationPreferences | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  savedCollegeIds: [],
  isAuthModalOpen: false,
  isRecommendationFlowOpen: false,
  authMode: "login",
  redirectPath: null,
  recommendationPreferences: null,
  setUser: (user) => set({ user }),
  setSavedCollegeIds: (ids) => set({ savedCollegeIds: ids }),
  addSavedCollegeId: (id) =>
    set((state) => ({
      savedCollegeIds: state.savedCollegeIds.includes(id)
        ? state.savedCollegeIds
        : [...state.savedCollegeIds, id],
    })),
  removeSavedCollegeId: (id) =>
    set((state) => ({
      savedCollegeIds: state.savedCollegeIds.filter((currentId) => currentId !== id),
    })),
  openAuthModal: (mode = "login", redirectPath = null) =>
    set({ isAuthModalOpen: true, authMode: mode, redirectPath }),
  closeAuthModal: () => set({ isAuthModalOpen: false, redirectPath: null }),
  setAuthMode: (mode) => set({ authMode: mode }),
  openRecommendationFlow: () => set({ isRecommendationFlowOpen: true }),
  closeRecommendationFlow: () => set({ isRecommendationFlowOpen: false }),
  setRecommendationPreferences: (recommendationPreferences) => set({ recommendationPreferences }),
}));
