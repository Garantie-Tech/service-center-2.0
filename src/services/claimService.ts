import Claim from "@/interfaces/ClaimInterface";
import { SubmitEstimate } from "@/interfaces/GlobalInterface";
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
