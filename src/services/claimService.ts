import { getRequest, postRequest, putRequest, deleteRequest } from "@/utils/api";

export const fetchClaims = async (params?: Record<string, any>) => {
  return await getRequest<{ claims: any[] }>("partners/claim", params);
};

export const fetchClaimStatuses = async (params?: Record<string, any>) => {
  return await getRequest<{ claimStatuses: any[] }>("claims/statuses", {});
};

export const fetchClaimById = async (claimId: string) => {
  return await getRequest<{ claim: any }>(`claims/${claimId}`);
};

export const createClaim = async (claimData: { title: string; description: string }) => {
  return await postRequest<{ claim: any }>("claims", claimData);
};

export const updateClaim = async (claimId: string, claimData: { title?: string; description?: string }) => {
  return await putRequest<{ claim: any }>(`claims/${claimId}`, claimData);
};

export const deleteClaim = async (claimId: string) => {
  return await deleteRequest<{ message: string }>(`claims/${claimId}`);
};
