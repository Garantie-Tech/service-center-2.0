import { ALLOWED_ISSUERS } from "@/globalConstant";
import { decodeJWT, logoutUser } from "@/helpers/globalHelper";
import {
  ClaimFetchPayload,
  GenerateLinkPaymentBody,
  RemarkPayload,
  RemarksApiResponse,
} from "@/interfaces/GlobalInterface";
import { DeviceReplacementPayload } from "@/services/claimService";
import { getCookie } from "@/utils/cookieManager";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message:
        response.status >= 500
          ? "Server is temporarily unavailable. Please try again."
          : text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    };
  }
}

function responseMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

// Function to format query parameters into a URL string
function formatQueryParams(
  params:
    | Record<string, string | number | boolean>
    | ClaimFetchPayload
    | RemarksApiResponse,
): string {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
  return queryString ? `?${queryString}` : "";
}

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?:
    | Record<string, unknown>
    | FormData
    | GenerateLinkPaymentBody
    | RemarkPayload
    | DeviceReplacementPayload,
  params?:
    | Record<string, string | number | boolean>
    | ClaimFetchPayload
    | RemarksApiResponse,
  extraHeaders: HeadersInit = {},
): Promise<ApiResponse<T>> {
  try {
    const token = await getCookie("token");
    const getTokenValue = decodeJWT(token || "");
    if (!getTokenValue || !ALLOWED_ISSUERS.includes(getTokenValue.iss)) {
      logoutUser();
    }

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body &&
        !(body instanceof FormData) && { "Content-Type": "application/json" }),
      ...extraHeaders,
    };

    const url = `${API_BASE_URL}/service/${endpoint}${
      method === "GET" && params ? formatQueryParams(params) : ""
    }`;

    const isFormData = body instanceof FormData;
    const fetchOptions: RequestInit = {
      method,
      headers,
      body:
        method !== "GET" && body
          ? isFormData
            ? body
            : JSON.stringify(body)
          : undefined,
    };
    if (!isFormData) {
      (fetchOptions as RequestInit & { next?: { revalidate: number } }).next = {
        revalidate: 60,
      };
    }

    const response = await fetch(url, fetchOptions);

    const rawData = await parseResponseBody(response);

    if (!response.ok) {
      return {
        success: false,
        error: responseMessage(rawData, "Something went wrong"),
      };
    }

    // Explicitly cast rawData to type T after successful response
    return { success: true, data: rawData as T };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

// Generic GET request
export function getRequest<T>(
  endpoint: string,
  params?:
    | Record<string, string | number | boolean>
    | ClaimFetchPayload
    | RemarksApiResponse,
  extraHeaders?: HeadersInit,
) {
  return apiRequest<T>(endpoint, "GET", undefined, params, extraHeaders);
}

// Generic POST request
export function postRequest<T>(
  endpoint: string,
  body:
    | Record<string, unknown>
    | FormData
    | GenerateLinkPaymentBody
    | RemarkPayload
    | DeviceReplacementPayload,
  extraHeaders?: HeadersInit,
) {
  return apiRequest<T>(endpoint, "POST", body, undefined, extraHeaders);
}

// Generic PUT request
export function putRequest<T>(
  endpoint: string,
  body: Record<string, unknown>,
  extraHeaders?: HeadersInit,
) {
  return apiRequest<T>(endpoint, "PUT", body, undefined, extraHeaders);
}

// Generic DELETE request
export function deleteRequest<T>(endpoint: string, extraHeaders?: HeadersInit) {
  return apiRequest<T>(endpoint, "DELETE", undefined, undefined, extraHeaders);
}

// External API request function for different base URL
export async function externalApiRequest<T>(
  baseUrl: string,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown> | FormData,
  extraHeaders: HeadersInit = {},
): Promise<ApiResponse<T>> {
  try {
    const token = await getCookie("token");
    const getTokenValue = decodeJWT(token || "");
    if (!getTokenValue || !ALLOWED_ISSUERS.includes(getTokenValue.iss)) {
      logoutUser();
    }
    const isForm = body instanceof FormData;

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isForm && body ? { "Content-Type": "application/json" } : {}), // only JSON if not FormData
      ...extraHeaders,
    };

    const url = `${baseUrl.replace(/\/$/, "")}/${endpoint}`;

    const response = await fetch(url, {
      method,
      headers,
      body:
        method !== "GET" && body
          ? isForm
            ? body
            : JSON.stringify(body)
          : undefined,
    });

    const rawData = await parseResponseBody(response);

    if (!response.ok) {
      return {
        success: false,
        error: responseMessage(rawData, "Something went wrong"),
      };
    }

    return { success: true, data: rawData as T };
  } catch (error) {
    console.error("External API request error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}
