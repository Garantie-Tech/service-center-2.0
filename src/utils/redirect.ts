export const redirectToClaimsPortal = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const baseUrl = isProduction
    ? "https://qa-claims.garantie.in/" // Live server
    : "https://qa-claims.garantie.in/"; // QA server

    window.open(baseUrl, "_blank");
};
