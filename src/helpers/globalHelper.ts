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
    status === "BER" ||
    status === "BER Repair" ||
    status === "BER SETTLE" ||
    status === "BER Replace"
  ) {
    return "Approval";
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
