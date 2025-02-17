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
  return "Claim Details";
};
