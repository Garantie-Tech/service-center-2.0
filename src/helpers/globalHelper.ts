import Claim from "@/interfaces/ClaimInterface";
import { Tab, TabStatus } from "@/interfaces/GlobalInterface";

export const getEstimateButtonLabel = (claimStatus: string): string => {
  if (
    claimStatus === "Claim Initiated" ||
    claimStatus === "Invalid Documents" ||
    claimStatus === "Estimate Revised"
  ) {
    return "Submit Estimate";
  }

  return "Submit Estimate";
};

export const isEstimateEditable = (claimStatus: string): boolean => {
  if (
    claimStatus === "Claim Submitted" ||
    claimStatus === "Claim Initiated" ||
    claimStatus === "Invalid Documents" ||
    claimStatus === "Estimate Revised"
  ) {
    return true;
  }
  return false;
};

export const getActiveTab = (status: string): string => {
  if (
    status === "Claim Initiated" ||
    status === "Estimate Revised" ||
    status === "Invalid Documents" ||
    status === "Claim Submitted"
  ) {
    return "Estimate";
  }
  if (
    status === "BER Marked" ||
    status === "BER Repair" ||
    status === "BER Replace" ||
    status === "Partially Approved"
  ) {
    return "Approval";
  }
  if (status === "Claim Cancelled") {
    return "Cancelled";
  }
  if (status === "Rejected") {
    return "Rejected";
  }
  if (
    status === "BER Repair Approved" ||
    status === "BER Replacement Approved" ||
    status === "BER Replace" ||
    status === "Approved"
  ) {
    return "Final Documents";
  }
  if (
    status === "Closed" ||
    status === "Settlement Completed" ||
    status === "Settlement Initiated" ||
    status === "BER Settlement Initiated" ||
    status === "BER Settlement Completed"
  ) {
    return "Settlement Details";
  }
  if (status === "BER SETTLE") {
    return "Customer Documents";
  }

  if (status === "Documents Verified") {
    return "Estimate";
  }
  return "Claim Details";
};

export const getFilteredTabs = (
  claimStatus: string,
  selectedClaim: Claim
): Tab[] => {
  if (["Claim Initiated", "Claim Submitted"].includes(claimStatus)) {
    return ["Claim Details", "Estimate"];
  }

  if (
    claimStatus === "Claim Cancelled" &&
    selectedClaim?.job_sheet_number &&
    selectedClaim?.approval_date
  ) {
    return ["Claim Details", "Estimate", "Approval", "Cancelled"];
  }

  if (claimStatus === "Claim Cancelled" && selectedClaim?.job_sheet_number) {
    return ["Claim Details", "Estimate", "Cancelled"];
  }

  if (claimStatus === "Claim Cancelled") {
    return ["Claim Details", "Cancelled"];
  }

  if (claimStatus === "BER Marked") {
    return ["Claim Details", "Estimate", "Approval"];
  }

  if (claimStatus === "Invalid Documents") {
    return ["Claim Details", "Estimate"];
  }

  if (claimStatus === "Documents Verified") {
    return ["Claim Details", "Estimate"];
  }

  if (["BER SETTLE"].includes(claimStatus)) {
    return ["Claim Details", "Estimate", "Approval", "Customer Documents"];
  }

  if (claimStatus === "Rejected") {
    return ["Claim Details", "Estimate", "Rejected"];
  }

  if (claimStatus === "Estimate Revised") {
    return ["Claim Details", "Estimate"];
  }

  if (
    [
      "Approved",
      "BER Approved",
      "BER Replacement Approved",
      "BER Repair Approved",
    ].includes(claimStatus)
  ) {
    return ["Claim Details", "Estimate", "Approval", "Final Documents"];
  }

  if (["Partially Approved"].includes(claimStatus)) {
    return ["Claim Details", "Estimate", "Approval"];
  }

  if (
    ["BER Repair", "BER Replace"].includes(claimStatus) &&
    !selectedClaim?.repair_payment_successful
  ) {
    return ["Claim Details", "Estimate", "Approval"];
  }

  if (
    [
      "Closed",
      "Settlement Completed",
      "Settlement Initiated",
      "BER Settlement Initiated",
      "BER Settlement Completed",
    ].includes(claimStatus) &&
    selectedClaim?.documents?.["16"]?.status == 1
  ) {
    return [
      "Claim Details",
      "Estimate",
      "Approval",
      "Final Documents",
      "Settlement Details",
    ];
  }

  if (
    [
      "Closed",
      "Settlement Completed",
      "Settlement Initiated",
      "BER Settlement Initiated",
      "BER Settlement Completed",
    ].includes(claimStatus) &&
    selectedClaim?.documents?.["76"]?.status == 1
  ) {
    return [
      "Claim Details",
      "Estimate",
      "Approval",
      "Customer Documents",
      "Settlement Details",
    ];
  }

  // return ["Claim Details", "Estimate", "Approval", "Final Documents"];
  return ["Claim Details", "Estimate", "Approval"];
};

export const getTabStatus = (
  tab: Tab,
  selectedClaim: Claim | null
): TabStatus => {
  if (!selectedClaim) return "empty";

  switch (tab) {
    case "Claim Details":
      return "success"; // Always success if claim exists
    case "Estimate":
      return selectedClaim?.documents?.["15"]?.status_reason_id ||
        selectedClaim?.documents?.["73"]?.status_reason_id ||
        selectedClaim?.status === "Claim Initiated"
        ? "error"
        : "success";
    case "Approval":
    case "Final Documents":
    case "Customer Documents":
      return "success";
    case "Cancelled":
      return selectedClaim?.cancellation_reason ? "error" : "success";
    case "Rejected":
      return selectedClaim?.is_rejected ? "error" : "success";
    case "Settlement Details":
      return false ? "error" : "success";
    default:
      return "empty";
  }
};

export const getStatusIcon = (status: TabStatus): string | null => {
  const iconMap: Record<TabStatus, string | null> = {
    success: "/images/check-icon.svg",
    error: "/images/action-required-icon.svg",
    empty: null,
  };

  return iconMap[status] ?? null;
};

export const getDocumentInfo = (
  selectedClaim: Claim | null,
  docKey: "16" | "74" | "75"
) => {
  const doc = selectedClaim?.documents?.[docKey];
  const status = doc?.status;
  const isDoc74 = docKey === "74";
  let statusValue = null;
  if (isDoc74) {
    statusValue = status === 1 ? true : status === 0 ? null : null;
  } else {
    statusValue = status === "1" ? true : status === "0" ? false : null;
  }

  const hasImages = (selectedClaim?.repaired_mobile_images?.length ?? 0) > 0;

  return {
    isInvalid: !!doc?.status_reason_id,
    invalidReason: doc?.status_reason || "",
    statusValue: statusValue,
    isValid: isDoc74 ? status === 1 : status === "1",
    hasInvalidStatus: isDoc74
      ? hasImages && statusValue === null
      : !!(doc?.url && statusValue === null),
  };
};

export const isIMEIFormat = (imei: string): boolean => {
  return /^\d{15}$/.test(imei);
};
