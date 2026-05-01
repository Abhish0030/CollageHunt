"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CompareStore = {
  ids: number[];
  addCollege: (id: number) => void;
  removeCollege: (id: number) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      ids: [],
      addCollege: (id) => set({ ids: [...new Set([...get().ids, id])].slice(0, 3) }),
      removeCollege: (id) => set({ ids: get().ids.filter((item) => item !== id) }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "gradly-compare",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
