import Claim from "@/interfaces/ClaimInterface";
import { Tab, TabStatus } from "@/interfaces/GlobalInterface";

export const getEstimateButtonLabel = (claimStatus: string): string => {
  if (claimStatus === "Claim Initiated") {
    return "Submit Estimate";
  }
  if (claimStatus === "Claim Submitted") {
    return "Edit Estimate";
  }
  if (
    claimStatus !== "BER Settlement Completed" &&
    claimStatus !== "Closed" &&
    claimStatus !== "Rejected"
  ) {
    return "Revise Estimate";
  }
  return "Submit Estimate";
};

export const isEstimateEditable = (claimStatus: string): boolean => {
  if (
    claimStatus === "BER Settlement Completed" ||
    claimStatus === "Closed" ||
    claimStatus === "Rejected"
  ) {
    return false;
  }
  return true;
};

export const getActiveTab = (status: string): string => {
  if (
    status === "Claim Initiated" ||
    status === "Estimate Revised" ||
    status === "Invalid Documents" ||
    status === "Claim Submitted" ||
    status === "Documents Verified"
  ) {
    return "Estimate";
  }
  if (
    status === "BER Marked" ||
    status === "BER Repair" ||
    status === "BER SETTLE" ||
    status === "BER Replace"
  ) {
    return "Approval";
  }
  if (
    status === "Claim Cancelled"
  ) {
    return "Cancelled";
  }
  if (
    status === "Rejected"
  ) {
    return "Rejected";
  }
  if (
    status === "Closed" ||
    status === "BER Repair Approved" ||
    status === "BER Replacement Approved" ||
    status === "BER Replace"
  ) {
    return "Final Documents";
  }
  if (
    status === "BER SETTLE" ||  
    status === "BER Settlement Initiated" ||
    status === "BER Settlement Completed"
  ) {
    return "Customer Documents";
  }
  return "Claim Details";
};

export const getFilteredTabs = (claimStatus: string): Tab[] => {
  if (["Claim Initiated", "Claim Submitted"].includes(claimStatus)) {
    return ["Claim Details", "Estimate"];
  }

  if (claimStatus === "Claim Cancelled") {
    return ["Claim Details", "Cancelled"];
  }

  if (claimStatus === "BER Marked") {
    return ["Claim Details", "Estimate", "Approval"];
  }

  if (
    ["BER SETTLE", "BER Settlement Initiated", "BER Settlement Completed"].includes(
      claimStatus
    )
  ) {
    return ["Claim Details", "Estimate", "Approval", "Customer Documents"];
  }

  if (claimStatus === "Rejected") {
    return ["Claim Details", "Rejected"];
  }

  return ["Claim Details", "Estimate", "Approval", "Final Documents"];
};

export const getTabStatus = (tab: Tab, selectedClaim: Claim | null): TabStatus => {
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