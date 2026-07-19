"use client";

import Claim from "@/interfaces/ClaimInterface";
import { Tab } from "@/interfaces/GlobalInterface";
import { getActiveTab } from "@/helpers/globalHelper";
import { useGlobalStore } from "@/store/store";

export const applyClaimSelection = (
  claim: Claim,
  preferredTab?: Tab | null,
) => {
  const {
    setSelectedClaim,
    setClaimStatus,
    setEstimateDetailsState,
    setApprovalDetails,
    setActiveTab,
    setClaimRevised,
    setNotificationTargetTab,
  } = useGlobalStore.getState();

  setSelectedClaim(claim);
  setClaimStatus(claim.status);
  setEstimateDetailsState({
    estimateAmount: claim?.claimed_amount || "",
    jobSheetNumber: claim?.job_sheet_number || "",
    estimateDetails: claim?.data?.inputs?.estimate_details || "",
    replacementConfirmed: claim?.imei_changed,
    damagePhotos: claim?.mobile_damage_photos || [],
    estimateDocument: claim?.documents?.["15"]?.url || null,
    documents: claim?.documents || undefined,
  });
  setApprovalDetails({
    estimateAmount: Number(claim?.claimed_amount),
    approvedAmount: Number(claim?.approved_amount),
    approvalType: claim?.status,
    approvalDate: claim?.approval_date,
    repairAmount: claim?.repair_amount,
    repairPaymentSuccessful: claim?.repair_payment_successful,
    repairPaymentLink: claim?.repair_payment_link,
    repairRazorpayOrderId: claim?.repair_razorpay_order_id,
    estimateDate: claim?.estimated_date,
    replacementPaymentSuccessful:
      claim?.data?.replacement_payment?.replace_payment_successful,
    replacementPaymentLink:
      claim?.data?.replacement_payment?.replace_payment_link,
    replacementAmount: claim?.data?.replacement_payment?.replace_amount,
  });

  setClaimRevised(false);

  if (preferredTab) {
    setActiveTab(preferredTab);
    setNotificationTargetTab(null);
    return;
  }

  setActiveTab(getActiveTab(claim.status) as Tab);
};
