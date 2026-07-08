"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNotification } from "@/context/NotificationProvider";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import { safeJsonParse } from "@/helpers/safeJson";
import {
  ClaimNotificationInboxResponse,
  ClaimNotificationItem,
} from "@/interfaces/GlobalInterface";
import {
  fetchClaimNotifications,
  markClaimNotificationRead,
} from "@/services/claimService";

type ClaimNotificationContextValue = {
  notifications: ClaimNotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  toggleInbox: () => void;
  closeInbox: () => void;
  openNotification: (notificationId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const ClaimNotificationContext = createContext<
  ClaimNotificationContextValue | undefined
>(undefined);

declare global {
  interface Window {
    __serviceCenterNotificationRealtime?: {
      echo: Echo<"pusher"> | null;
      subscriptions: Set<string>;
    };
    Pusher?: typeof Pusher;
  }
}

const normalizeBroadcastHost = (rawHost: string, backendUrl: string) => {
  const fallbackHost = (() => {
    try {
      return new URL(backendUrl).hostname;
    } catch {
      return window.location.hostname;
    }
  })();

  const trimmedHost = rawHost.trim();
  if (!trimmedHost) return fallbackHost;

  const hostWithoutProtocol = trimmedHost.replace(/^https?:\/\//i, "");
  if (
    hostWithoutProtocol === "localhost" ||
    hostWithoutProtocol === "127.0.0.1" ||
    hostWithoutProtocol.startsWith("ws.")
  ) {
    return fallbackHost;
  }

  return hostWithoutProtocol.replace(/:\d+$/, "");
};

const resolveBackendDefaults = (backendUrl: string) => {
  try {
    const url = new URL(backendUrl);
    return {
      host: url.hostname,
      scheme: url.protocol.replace(":", ""),
      port: url.protocol === "https:" ? 443 : 80,
    };
  } catch {
    return {
      host: window.location.hostname,
      scheme: window.location.protocol.replace(":", ""),
      port: window.location.protocol === "https:" ? 443 : 80,
    };
  }
};

const getBroadcasterConfig = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";
  const authEndpoint = `${backendUrl.replace(/\/$/, "")}/broadcasting/auth`;
  const backendDefaults = resolveBackendDefaults(backendUrl);
  const key =
    process.env.NEXT_PUBLIC_BROADCAST_KEY ||
    process.env.NEXT_PUBLIC_REVERB_APP_KEY ||
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
    "";

  return {
    broadcaster: "pusher",
    key,
    host: normalizeBroadcastHost(
      process.env.NEXT_PUBLIC_BROADCAST_HOST ||
        process.env.NEXT_PUBLIC_REVERB_HOST ||
        "",
      backendUrl,
    ),
    port: Number(
      process.env.NEXT_PUBLIC_BROADCAST_PORT ||
        process.env.NEXT_PUBLIC_REVERB_PORT ||
        backendDefaults.port,
    ),
    scheme:
      process.env.NEXT_PUBLIC_BROADCAST_SCHEME ||
      process.env.NEXT_PUBLIC_REVERB_SCHEME ||
      backendDefaults.scheme,
    cluster:
      process.env.NEXT_PUBLIC_BROADCAST_CLUSTER ||
      process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER ||
      "mt1",
    authEndpoint,
  };
};

const getNotificationChannels = (): string[] => {
  if (typeof window === "undefined") return [];

  const channels = new Set<string>();

  try {
    type StoredUser = {
      user_type?: string;
      id?: string | number;
    } | null;

    const user = safeJsonParse<StoredUser>(
      localStorage.getItem("user"),
      null,
    );
    const storedStates = safeJsonParse<Record<string, string>>(
      localStorage.getItem("states"),
      {},
    );
    const stateIds = Object.keys(storedStates || {});
    const userType = user?.user_type ?? "";

    if (userType === "service_centre" && user?.id) {
      channels.add(`claim.notifications.service-centre.${user.id}`);
    }

    if (["service_head", "service_head_ho"].includes(userType)) {
      stateIds.forEach((stateId) => {
        channels.add(`claim.notifications.service-head.state.${stateId}`);
      });
    }
  } catch (error) {
    console.error("Failed to resolve notification channels", error);
  }

  return Array.from(channels);
};

const ensureEcho = (): Echo<"pusher"> | null => {
  if (typeof window === "undefined") return null;

  window.__serviceCenterNotificationRealtime ??= {
    echo: null,
    subscriptions: new Set<string>(),
  };

  const config = getBroadcasterConfig();
  if (!config.key) return null;

  if (window.__serviceCenterNotificationRealtime.echo) {
    return window.__serviceCenterNotificationRealtime.echo;
  }

  window.Pusher = Pusher;

  window.__serviceCenterNotificationRealtime.echo = new Echo({
    broadcaster: "pusher",
    key: config.key,
    ...(config.host
      ? {
          wsHost: config.host,
          wsPort: config.port,
          wssPort: config.port,
        }
      : {}),
    forceTLS: config.scheme === "https" || window.location.protocol === "https:",
    enabledTransports: ["ws", "wss"],
    cluster: config.cluster || "mt1",
    authEndpoint: config.authEndpoint,
    auth: {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        ...(localStorage.getItem("token")
          ? {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          : {}),
      },
    },
  });

  return window.__serviceCenterNotificationRealtime.echo;
};

export const ClaimNotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<ClaimNotificationItem[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const { notifyError } = useNotification();
  const router = useRouter();
  const pathname = usePathname();
  const authUser = useAuthStore((state) => state.user);

  const { triggerClaimRefresh, setSearchTerm, handleSearch, setNotificationTargetTab } =
    useGlobalStore();

  const refreshNotifications = async () => {
    try {
      const response = await fetchClaimNotifications();

      if (response.success && response.data) {
        const inbox = (response.data as unknown as {
          data?: ClaimNotificationInboxResponse;
        })?.data;
        setNotifications(inbox?.notifications || []);
        setUnreadCount(inbox?.unread_count || 0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to refresh claim notifications", error);
    }
  };

  useEffect(() => {
    if (!authUser.token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      return;
    }

    refreshNotifications();
  }, [authUser.token]);

  useEffect(() => {
    if (!authUser.token) return;

    const echo = ensureEcho();
    const channels = getNotificationChannels();

    if (!echo || channels.length === 0) {
      return;
    }

    const subscribedChannels: string[] = [];

    channels.forEach((channel) => {
      const subscriptionKey = `private:${channel}`;

      if (window.__serviceCenterNotificationRealtime?.subscriptions.has(subscriptionKey)) {
        return;
      }

      window.__serviceCenterNotificationRealtime?.subscriptions.add(subscriptionKey);
      subscribedChannels.push(channel);

      echo.private(channel).listen(".claim.notification.changed", (payload: ClaimNotificationItem) => {
        void refreshNotifications();

        const selectedClaimId = useGlobalStore.getState().selectedClaim?.id;
        if (selectedClaimId && Number(payload.claim_id) === Number(selectedClaimId)) {
          triggerClaimRefresh();
        }
      });
    });

    return () => {
      subscribedChannels.forEach((channel) => {
        echo.leave(channel);
        window.__serviceCenterNotificationRealtime?.subscriptions.delete(`private:${channel}`);
      });

      window.__serviceCenterNotificationRealtime?.echo?.disconnect();
      if (window.__serviceCenterNotificationRealtime) {
        window.__serviceCenterNotificationRealtime.echo = null;
        window.__serviceCenterNotificationRealtime.subscriptions.clear();
      }
    };
  }, [authUser.token, authUser.user_type, authUser.id, triggerClaimRefresh]);

  const closeInbox = () => setIsOpen(false);
  const toggleInbox = () => setIsOpen((value) => !value);

  const openNotification = async (notificationId: number) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification) return;

    try {
      const response = await markClaimNotificationRead(notificationId);

      const payload = response.success
        ? (response.data as unknown as {
            data?: {
              notification?: ClaimNotificationItem;
              unread_count?: number;
            };
          })?.data
        : null;

      if (!response.success || !payload) {
        notifyError("Failed to open the notification.");
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      );
      setUnreadCount(payload.unread_count ?? Math.max(0, unreadCount - 1));

      setNotificationTargetTab(
        notification.target_tab === "estimate" ? "Estimate" : "Final Documents",
      );
      setSearchTerm(String(notification.claim_id));
      handleSearch();

      if (pathname !== "/dashboard") {
        router.push("/dashboard");
      }

      setIsOpen(false);
      triggerClaimRefresh();
    } catch (error) {
      console.error("Failed to open notification", error);
      notifyError("Failed to open the notification.");
    }
  };

  const value: ClaimNotificationContextValue = {
    notifications,
    unreadCount,
    isOpen,
    toggleInbox,
    closeInbox,
    openNotification,
    refreshNotifications,
  };

  return (
    <ClaimNotificationContext.Provider value={value}>
      {children}
    </ClaimNotificationContext.Provider>
  );
};

export const useClaimNotifications = () => {
  const context = useContext(ClaimNotificationContext);

  if (!context) {
    throw new Error(
      "useClaimNotifications must be used within a ClaimNotificationProvider",
    );
  }

  return context;
};
