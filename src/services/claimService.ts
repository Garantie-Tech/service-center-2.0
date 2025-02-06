import Claim from "@/interfaces/ClaimInterface";
import { getRequest } from "@/utils/api";

export interface ClaimResponse {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data: {
    claims: Claim[];
  };
}

export const fetchClaims = async (_params?: Record<string, string | number | boolean>) => {
  return await getRequest<ClaimResponse>("partners/claim", _params);
};
