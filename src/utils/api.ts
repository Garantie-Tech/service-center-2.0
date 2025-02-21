import { ClaimFetchPayload } from "@/interfaces/GlobalInterface";
import { getCookie } from "@/utils/cookieManager";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";

// Function to format query parameters into a URL string
function formatQueryParams(params: Record<string, string | number | boolean> | ClaimFetchPayload): string {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  return queryString ? `?${queryString}` : "";
}

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown> | FormData,
  params?: Record<string, string | number | boolean> | ClaimFetchPayload,
  extraHeaders: HeadersInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getCookie("token");

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && !(body instanceof FormData) && { "Content-Type": "application/json" }),
      ...extraHeaders,
    };

    const url = `${API_BASE_URL}/${endpoint}${method === "GET" && params ? formatQueryParams(params) : ""}`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Caching strategy
      method,
      headers,
      body: method !== "GET" && body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });

    // Ensure the response is valid JSON
    const rawData = await response.json();

    if (!response.ok) {
      return { success: false, error: (rawData as { message?: string })?.message || "Something went wrong" };
    }

    // Explicitly cast rawData to type T after successful response
    return { success: true, data: rawData as T };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

// Generic GET request
export function getRequest<T>(endpoint: string, params?: Record<string, string | number | boolean> | ClaimFetchPayload, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "GET", undefined, params, extraHeaders);
}

// Generic POST request
export function postRequest<T>(endpoint: string, body: Record<string, unknown> | FormData, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "POST", body, undefined, extraHeaders);
}

// Generic PUT request
export function putRequest<T>(endpoint: string, body: Record<string, unknown>, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "PUT", body, undefined, extraHeaders);
}

// Generic DELETE request
export function deleteRequest<T>(endpoint: string, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "DELETE", undefined, undefined, extraHeaders);
}
