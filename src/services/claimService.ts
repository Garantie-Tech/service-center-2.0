import Claim from "@/interfaces/ClaimInterface";
import { BerDecision, SubmitEstimate } from "@/interfaces/GlobalInterface";
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
  _params?: Record<string, string | number | boolean>
) => {
  return await getRequest<ClaimResponse>("partners/claim", _params);
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

