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

  const validEmailList = [
    "lucknowcentral.vivo.up@gmail.com",
    "khan.naved305@gmail.com",
    "firozabad.vivo.up@gmail.com",
    "pukhrayan.vivo.up@gmail.com",
    "Kanpurcentral123@gmail.com",
    "kanpur.vivo.up@gmail.com",
    "bhiwandi.sc@vivoelectronics.com",
    "kurla.sc@vivoelectronics.com",
    "ghatkopar.sc@vivoelectronics.com",
    "l3ahmedabad@vivogujarat.com",
    "Suresh.Kumar@vivorajasthan.com",
    "ravindra.ghuge@junwei.in",
    "nashik.vivoglobal@gmail.com",
    "parbhani.vivoglobal@gmail.com",
    "l3surat@vivogujarat.com",
    "l3bapunagar@vivogujarat.com",
    "rashesh.raval@vivogujarat.com",
    "gaurav.chaturvedi@vivoup.in",
    "naresh.patel@vivogujarat.com",
    "ritesh.sonawane@junwei.in",
    "abdul.shaikh@vivoelectronics.com"
  ];

  const handleLogin = async (credentials: LoginCredentials) => {
    if (validEmailList.includes(credentials.email)) {
      try {
        setIsLoading(true);
        const userData = await loginService(credentials);
        notifySuccess("Login Successful");
        setUser({
          token: userData?.data?.token || null,
          name: userData?.data?.name || null,
          id: userData?.data?.service_centre_id || null,
          user_type: userData?.data?.user_type || null,
        });

        router.push("/dashboard");
      } catch (error) {
        if (error instanceof Error) {
          notifyError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      notifyError("Sorry, you're not authorized to use this service center.");
    }
  };

  return (
    <div className="flex h-screen">
      <LoginFormLeftSection />
      <LoginFormRightSection onSubmit={handleLogin} />
    </div>
  );
}
