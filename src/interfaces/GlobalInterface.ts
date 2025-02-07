export interface ExportData {
  "Service Req No": number;
  "Job Sheet Number": string;
  "Device MOP": number;
  "Estimate Amount": string;
  "Approved Amount": string;
  "Co-Payment Amount": number;
  "Customer Partial Payment Amount": number | null;
  "Claim Date": string;
  "Customer Name": string;
  "Plan Name": string;
  "IMEI Number": string;
  "Preferred Service Centre": string;
  "Estimation Provided By": string;
  "State": string;
  "Estimate Date": string;
  "Approved Date": string;
  "Final Doc Received Date": string | null;
  "Final Doc Validated Date": string | null;
  "Payment to Service Centre": string | null;
  "Payment Date": string | null;
  "UTRN": string | null;
  "Claim Status": string;
  "Pending With": string;
  "Remarks": string;
  "Doc Dependency": string;
  "Rejection Reason": string;
}

export interface ExportResponse {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data: ExportData[];
}

export const CLAIM_TABS = [
  "Claim Details",
  "Estimate",
  "Approval",
  "Final Documents",
] as const;

export type Tab = typeof CLAIM_TABS[number]; 

export type TabStatus = "success" | "error" | "empty";