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
  status_code: number;
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
  "Settlement Details",
] as const;

export type Tab = (typeof CLAIM_TABS)[number];

export type TabStatus = "success" | "error" | "empty";

export interface SubmitEstimate {
  success: boolean;
  status_code: number;
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
  replacementConfirmed: boolean | string | "yes" | "no" | null | "";
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
    estimateDate?: string;
    replacementPaymentSuccessful?: boolean;
    replacementPaymentLink?: string;
    replacementAmount?: number;
  };
  setApprovalDetails: (
    updatedDetails: Partial<ApprovalState["approvalDetails"]>
  ) => void;
}

export interface pickupTrackingInterface {
  id: number;
  claim_id: number;
  is_readyfor_pickup?: boolean;
  is_pickup_initiated?: boolean;
  is_picked?: boolean;
  created_at?: string;
  updated_at?: string;
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
  status_code: number;
  message: string;
  data?: {
    claimID: number;
    berDecision: string;
    newDeviceAmount?: string;
  };
}

export interface CancelClaim {
  success: boolean;
  status_code: number;
  message: string;
  data?: {
    cancellation_reason: string;
    cancelled_by: string;
    update_type?: string;
  };
}

export interface PickupTrackingResponse {
  success: boolean;
  status_code: number;
  message: string;
  data?: {
    message: string;
    claimId: number;
    error?: string;
    error_msg?: string;
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
  claim_type?: string;
  sort_by?: string;
  state_id?: string;
}

export interface UploadFinalDocuments {
  success: boolean;
  status_code: number;
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
  status_code: number;
  message: string;
  data?: {
    entity_id: number;
    payment_type: string;
    entity: string;
    is_monthly: boolean;
    is_recurring: string;
    payment_method: string;
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
  status_code: number;
  message: string;
  data?: TimelineEvent[];
}

export interface UploadCustomerDocuments {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    claimID: number;
    message: number;
  };
}

export interface Remark {
  id: number;
  remark: string;
  entity: string;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  data?: null;
  type: string;
  added_by_platform: string;
  added_at: string;
  added_by_user: string;
  remark_type: number;
  pivot: {
    claim_id: number;
    remark_id: number;
    created_at: string | null;
    updated_at: string | null;
  };
}

export interface RemarksApiResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    items: Remark[];
  };
}

export interface RemarkPayload {
  added_by_platform: string;
  remark: string;
}

export interface ServiceCenterProfileResponse {
  success: boolean;
  status_code: number;
  message: string;
  data?: ServiceCenterProfile;
}

export interface ServiceCenterProfile {
  id: number;
  partner_id: number;
  name: string;
  service_centre_type: string | null;
  mobile: string;
  mobile_verified: boolean;
  email: string;
  otp: string | null;
  address: {
    address_line_1: string;
    address_line_2: string | null;
  };
  city_id: number;
  city: string;
  state_id: number;
  state: string;
  pincode: string;
  data?: null;
  pan: string | null;
  gst: string | null;
  neft: string | null;
  is_active?: boolean;
  credit_limit: number | null;
  is_registered: boolean;
  invoicing_modal: string | null;
  invoice_limit: number | null;
  created_at: string;
  updated_at: string;
  landline: string;
  landmark: string;
  user?: User[];
}

export interface User {
  id: number;
  email: string;
  mobile: string;
  is_active: boolean;
  created_at: string;
  type: string;
}

export interface PolicyItem {
  id: number;
  product_id: number;
  product_code: string;
  sum_insured: string;
  start_date: string;
  end_date: string;
  premium: string;
  is_monthly: boolean;
  policy_number: string;
  policy_creation_ts: string;
  email: string;
  mobile: string;
  name: string;
  product_name: string;
  price_range: string;
  product_display_name: string;
  provider_name: string;
  status: string;
  invoicing_modal: string;
  commission: string;
  oem_commission: string;
  oem_commission_part: string;
  state_commission_part: string;
  is_embedded: boolean;
  code: string;
  store_code: string;
  state_code: string;
  retail_location: string;
  invoice_amount: string;
  invoice_number: string;
  imei_number: string;
  phone_model: string;
  cancelled_date: string | null;
  is_cancelled: string;
  contract_start_date: string | null;
  status_id: number;
  transaction_number: string;
  payment_mode: string;
  promoter_id: number | null;
  garantie_commission: number;
  model_price: number;
  discount_percent: number | null;
  discounted_premium: number;
  actual_premium: number;
  invoice_id: number | null;
  is_invoice_generated: string;
  ownership_type: string;
  owning_group: string;
  device_invoice_date: string;
  zone_name: string | null;
  zone_manager_name: string | null;
}

export interface PolicyResponseData {
  policies: PolicyItem[];
  total_count: number;
}

export interface PolicyApiResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: PolicyResponseData;
}

export type StateMap = Record<string, string> | undefined;

export type ImeiApi = {
  imeis?: string[];
  is_image_valid?: boolean;
  status?: string;
  message?: string;
};
