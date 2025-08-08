// track.ts (or keep in same file)
import { getRequest } from "@/utils/api";

interface ScanDetail {
  date: string;
  status: string;
  location: string;
}
export interface TrackingData {
  order_id: string;
  refrence_id: string;
  awb_number: string;
  courier: string;
  order_status: string;
  expected_delivery_date: string | null;
  current_status: string;
  status_time: string;
  scan_detail?: ScanDetail[];
}

interface RawTrackingResponse {
  result: string;          // "1" | "0"
  message: string;
  data?: TrackingData;
}

// Envelope your getRequest returns
interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function fetchTrackingDetails(awb: string): Promise<TrackingData> {
  const resp = await getRequest<ApiEnvelope<RawTrackingResponse>>(
    `v1/track-order?awb_number=${awb}`
  );

  if (!resp?.success) {
    throw new Error(resp?.message || "Failed to fetch tracking details.");
  }

  const inner = resp.data; // { result, message, data }
  if (!inner || inner.result !== "1") {
    throw new Error(inner?.message || "Tracking details not available.");
  }

  if (!inner.data) {
    throw new Error("Empty tracking payload.");
  }

  return inner.data; // return clean TrackingData
}
