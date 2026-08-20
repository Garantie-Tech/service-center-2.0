export const SORT_OPTIONS = [
  { key: "SRN", label: "SRN" },
  // { key: "FOLLOW_UP", label: "Follow UP" },
  // { key: "TIME", label: "Time" },
] as const;

export const MIN_DAMAGE_IMAGES = 5;
export const MAX_DAMAGE_IMAGES = 11;
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const ALLOWED_ISSUERS = [
  "https://qa-platform.garantie.in/",
  "https://prod-platform.garantie.in/",
  "https://pyqa.garantie.in/",
  "https://py.garantie.in/",
  "https://upgrade-claim.garantie.in/",
];

const normalizeIssuer = (issuer: string) => issuer.replace(/\/+$/, "");

export const isAllowedIssuer = (issuer: string | null | undefined): boolean => {
  if (!issuer) return false;

  const normalizedIssuer = normalizeIssuer(issuer);
  return ALLOWED_ISSUERS.some(
    (allowedIssuer) => normalizeIssuer(allowedIssuer) === normalizedIssuer,
  );
};
