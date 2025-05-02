"use client";

import { StateMap } from "@/interfaces/GlobalInterface";
import { create } from "zustand";

interface User {
  token: string | null;
  name: string | null;
  id: string | null;
  user_type?: string | null;
  states?: StateMap;
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
        : { name: null, id: null, user_type: null };
      return {
        token,
        name: parsedUser.name,
        id: parsedUser.id,
        user_type: parsedUser.user_type,
      };
    }
    return { token: null, name: null, id: null, user_type: null };
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
          user_type: user.user_type,
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
      user: { token: null, name: null, id: null, user_type: null },
      isAuthenticated: false,
    });
  },
}));
