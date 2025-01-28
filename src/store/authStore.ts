"use client";

import { create } from "zustand";

interface User {
  token: string | null;
  name: string | null;
  id: string | null;
}

interface AuthState {
  user: User;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser
        ? JSON.parse(storedUser)
        : { name: null, id: null };
      return { token, name: parsedUser.name, id: parsedUser.id };
    }
    return { token: null, name: null, id: null };
  })(),
  isAuthenticated:
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false,
  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", user.token || "");
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.name,
          id: user.id,
        })
      );
    }
    set({ user, isAuthenticated: !!user.token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0; secure; samesite=strict";
    }
    set({
      user: { token: null, name: null, id: null },
      isAuthenticated: false,
    });
  },
}));
