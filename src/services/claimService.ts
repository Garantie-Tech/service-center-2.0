import Claim from "@/interfaces/ClaimInterface";
import { BerDecision, ClaimFetchPayload, SubmitEstimate } from "@/interfaces/GlobalInterface";
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

export const fetchClaims = async (
  _params?: Record<string, string | number | boolean> | ClaimFetchPayload
) => {
  return await getRequest<ClaimResponse>("partners/service-center-claim", _params);
};

export const submitEstimate = async (
  claimID: number,
  body: FormData
) => {
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

export const fetchClaimCancelReason = async (
  _params?: Record<string, string | number | boolean>
) => {
  try {
    const response = await getRequest("claims/reasons", _params);
    return response;
  } catch (error) {
    console.error("Error fetching claim cancel reasons:", error);
    return { success: false, data: {} };
  }
};