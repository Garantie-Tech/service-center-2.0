export const redirectToClaimsPortal = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_INITIATE_CLAIM_URL ?? "";
  window.open(baseUrl, "_blank");
};
