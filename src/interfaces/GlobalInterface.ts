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
  State: string;
  "Estimate Date": string;
  "Approved Date": string;
  "Final Doc Received Date": string | null;
  "Final Doc Validated Date": string | null;
  "Payment to Service Centre": string | null;
  "Payment Date": string | null;
  UTRN: string | null;
  "Claim Status": string;
  "Pending With": string;
  Remarks: string;
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
  "Customer Documents",
  "Cancelled",
  "Rejected",
] as const;

export type Tab = (typeof CLAIM_TABS)[number];

export type TabStatus = "success" | "error" | "empty";

export interface SubmitEstimate {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data: {
    message: string;
    claimID: number;
  };
}

export interface EstimateDetailsState {
  estimateAmount: string;
  jobSheetNumber: string;
  estimateDetails: string;
  replacementConfirmed: string | "yes" | "no" | null | '';
  damagePhotos: (string | File)[];
  estimateDocument: File | string | null;
  documents?: Documents;
}

export interface ApprovalState {
  approvalDetails: {
    estimateAmount: number;
    approvedAmount: number;
    approvalType: string;
    deviceAmount?: string;
    berDecision?: string;
    approvalDate?: string;
    repairAmount?: number;
    repairPaymentSuccessful?: boolean;
    repairPaymentLink?: string;
    repairRazorpayOrderId?: string;
  };
  setApprovalDetails: (
    updatedDetails: Partial<ApprovalState["approvalDetails"]>
  ) => void;
}

export interface DocumentItem {
  title: string;
  status?: string | number | null;
  status_reason_id?: string | number | null;
  status_reason?: string | null;
  url?: string | null;
}

// Fixed document keys
export interface Documents {
  "15"?: DocumentItem;
  "73"?: DocumentItem;
}

export interface BerDecision {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data?: {
    claimID: number;
    berDecision: string;
    newDeviceAmount?: string;
  };
}

export interface CancelClaim {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data?: {
    cancellation_reason: string;
    cancelled_by: string;
    update_type?: string;
  };
}

export interface ClaimFetchPayload {
  page: number;
  partner_id: number;
  date?: string;
  source: string;
  duration?: string;
  claim_status?: string | null;
  startDate?: string;
  endDate?: string;
  claim_search?: string;
}

export interface UploadFinalDocuments {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data: {
    documentId: number;
    documentTypeId: string;
    fileCount: number;
    thumbnail: string;
  };
}

export interface GeneratePaymentLink {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data?: {
    entity_id: number,
    payment_type: string,
    entity: string,
    is_monthly: boolean,
    is_recurring: string,
    payment_method: string,
  };
}

export interface GenerateLinkPaymentBody {
  entity_id: number;
  payment_type: string;
  entity: string;
  is_monthly: boolean;
  is_recurring: boolean;
  payment_method: boolean;
}

export interface TimelineEvent {
  label: string;
  time: string;
}

export interface ClaimTimeline {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data?: TimelineEvent[];
}