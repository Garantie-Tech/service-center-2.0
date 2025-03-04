import Claim from "@/interfaces/ClaimInterface";
import {
  BerDecision,
  CancelClaim,
  ClaimFetchPayload,
  GenerateLinkPaymentBody,
  GeneratePaymentLink,
  SubmitEstimate,
  UploadFinalDocuments,
} from "@/interfaces/GlobalInterface";
import { getRequest, postRequest } from "@/utils/api";

export interface ClaimResponse {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data: {
    claims: Claim[];
  };
}

interface ClaimCancelReasonResponse {
  success: boolean;
  data: Record<string, string>;
}

export const fetchClaims = async (
  _params?: Record<string, string | number | boolean> | ClaimFetchPayload
) => {
  return await getRequest<ClaimResponse>(
    "partners/service-center-claim",
    _params
  );
};

export const submitEstimate = async (claimID: number, body: FormData) => {
  const endpoint = `submit/estimate/${claimID}`;
  return await postRequest<SubmitEstimate>(endpoint, body);
};

export const handleBerDecision = async (
  claimID: number,
  berDecision: string,
  newDeviceAmount?: string
) => {
  const endpoint = `claim/update/${claimID}`;
  const body: Record<string, string> = {
    update_type: "ber_decision",
    ber_decision: berDecision,
  };

  if (newDeviceAmount) {
    body.new_device_amount = newDeviceAmount;
  }

  try {
    const response = await postRequest<BerDecision>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error updating BER decision:", error);
    throw error;
  }
};

export const fetchClaimCancelReason =
  async (): Promise<ClaimCancelReasonResponse> => {
    try {
      const response = await getRequest("claims/reasons");

      if (response && response.success) {
        return response as ClaimCancelReasonResponse; // Explicitly cast response
      }

      return { success: false, data: {} };
    } catch (error) {
      console.error("Error fetching claim cancel reasons:", error);
      return { success: false, data: {} };
    }
  };

export const uploadFinalDocuments = async (claimID: number, body: FormData) => {
  const endpoint = `service-claim/document/submit/${claimID}`;
  return await postRequest<UploadFinalDocuments>(endpoint, body);
};

export const handleCancelClaim = async (
  claimID: number,
  reason: string,
) => {
  const endpoint = `claim/update/${claimID}`;
  const body: Record<string, string> = {
    cancellation_reason: reason,
    cancelled_by: 'Service Centre',
    update_type: 'cancel_claim',
  };

  try {
    const response = await postRequest<CancelClaim>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error Canceling Claim:", error);
    throw error;
  }
};

export const generatePaymentLink = async (
  claimID: number,
  paymentType: string,
  type: string
) => {
  const endpoint = `payments/link`;
  const body: GenerateLinkPaymentBody = {
    entity_id: claimID,
    payment_type : paymentType,
    entity: type,
    is_monthly: false,
    is_recurring: false,
    payment_method: false,
  };

  try {
    const response = await postRequest<GeneratePaymentLink>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error Generating Payment Link:", error);
    throw error;
  }
};