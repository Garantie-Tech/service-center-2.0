"use client";

import { useEffect, useState } from "react";
import { ServiceCenterProfile } from "@/interfaces/GlobalInterface";
import { getServiceCenterProfileData } from "@/services/claimService";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";

const useSyncAuthenticatedProfile = (): boolean => {
  const setUser = useAuthStore((state) => state.setUser);
  const setStateOptions = useGlobalStore((state) => state.setStateOptions);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      try {
        const response = await getServiceCenterProfileData();

        if (!response?.success || !response?.data?.data) {
          return;
        }

        const profile = response.data.data as ServiceCenterProfile;
        const profileUser = profile.user?.[0];
        const currentUser = useAuthStore.getState().user;
        const cookieToken =
          typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((entry) => entry.startsWith("token="))
                ?.slice("token=".length) ?? null
            : null;
        const storedToken =
          currentUser.token ||
          (typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null) ||
          cookieToken;

        const permissions =
          profile.permissions && profile.permissions.length > 0
            ? profile.permissions
            : currentUser.permissions ?? [];
        const states =
          profile.states && Object.keys(profile.states).length > 0
            ? profile.states
            : currentUser.states ?? {};

        setUser({
          token: storedToken,
          name: profile.name ?? currentUser.name,
          id: profileUser?.id ?? profile.id ?? currentUser.id,
          user_type: profileUser?.type ?? currentUser.user_type ?? null,
          permissions,
          states,
        });
        setStateOptions(states);

        if (typeof window !== "undefined") {
          localStorage.setItem("states", JSON.stringify(states ?? {}));
        }
      } catch (error) {
        console.error("Failed to sync authenticated profile:", error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [setStateOptions, setUser]);

  return isReady;
};

export default useSyncAuthenticatedProfile;
