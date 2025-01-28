"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { loginService, LoginCredentials } from "@/services/authService";
import LoginFormLeftSection from "@/components/layout/LoginFormLeftSection";
import LoginFormRightSection from "@/components/layout/LoginFormRightSection";
import { useNotification } from "@/context/NotificationProvider";
import { useGlobalStore } from "@/store/store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { notifySuccess, notifyError } = useNotification();
  const setIsLoading = useGlobalStore((state) => state.setIsLoading);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const userData = await loginService(credentials);
      notifySuccess("Login Successful");
      setUser({
        token: userData?.data?.token || null,
        name: userData?.data?.name || null,
        id: userData?.data?.service_centre_id || null,
      });

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        notifyError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <LoginFormLeftSection />
      <LoginFormRightSection onSubmit={handleLogin} />
    </div>
  );
}
