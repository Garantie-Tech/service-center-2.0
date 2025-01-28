"use client";

import { create } from "zustand";

interface StoreType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useGlobalStore = create<StoreType>((set) => ({
  isLoading: false,
  setIsLoading: (loading: boolean) => set(() => ({ isLoading: loading })),
}));
