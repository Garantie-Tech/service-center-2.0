import { StateMap } from "@/interfaces/GlobalInterface";
import { addCookie, getCookie } from "@/utils/cookieManager";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  success: boolean;
  message: string;
  data?: {
    name?: string;
    service_centre_id?: string;
    token?: string;
    user_type?: string;
    states?: StateMap;
  };
};

export type ResetPasswordPayload = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  code?: string;
  message: string;
  data?: {
    status: string;
    msg: string;
  };
};

export async function loginService(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/service/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...credentials,
        grant_type: "password",
        user_type: "service_centre",
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Invalid credentials");
  }

  const data = await response.json();
  if (!data?.success) {
    throw new Error(data?.message || "Invalid credentials");
  }

  // Save necessary data in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data?.data?.token || "");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: data?.data?.name,
        id: data?.data?.service_centre_id,
        user_type: data?.data?.user_type,
      })
    );
  }

  // Save token in cookies using the cookie manager
  await addCookie("token", data?.data?.token || "", {
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Set to true if the token is only needed server-side
    path: "/",
    maxAge: 100 * 365 * 24 * 60 * 60, // 7 days
  });

  return data;
}

export async function resetPassword(
  credentials: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  const token = await getCookie("token");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/service/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        ...credentials,
      }),
    }
  );

  const data = await response.json();

  return data;
}
