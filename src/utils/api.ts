import { getCookie } from "@/utils/cookieManager";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";

function formatQueryParams(params: Record<string, any>): string {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `?${queryString}` : "";
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  params?: Record<string, any>,
  extraHeaders: HeadersInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getCookie("token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...extraHeaders,
    };

    const url = `${API_BASE_URL}/${endpoint}${method === "GET" && params ? formatQueryParams(params) : ""}`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
      method,
      headers,
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Something went wrong" };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
}

export function getRequest<T>(endpoint: string, params?: Record<string, any>, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "GET", undefined, params, extraHeaders);
}

export function postRequest<T>(endpoint: string, body: any, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "POST", body, undefined, extraHeaders);
}

export function putRequest<T>(endpoint: string, body: any, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "PUT", body, undefined, extraHeaders);
}

export function deleteRequest<T>(endpoint: string, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "DELETE", undefined, undefined, extraHeaders);
}
