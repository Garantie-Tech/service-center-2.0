"use client";

import { useGlobalStore } from "@/store/store";
import CustomSelect from "@/components/ui/CustomSelect";
import { useEffect, useState } from "react";
import BerRepairModal from "@/components/BerRepairModel";
import { useNotification } from "@/context/NotificationProvider";
import {
  generatePaymentLink,
  handleBerDecision,
  handlePickupTrackingStatus,
} from "@/services/claimService";
import Link from "next/link";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import BerReplaceModal from "../BerReplaceModel";
import BerSettleModal from "../BerSettleModel";
import { formatToDateTime } from "@/helpers/dateHelper";
// import { convertDateTime } from "@/helpers/dateHelper";

const ApprovalDetailsTab: React.FC = () => {
  const {
    approvalDetails,
    setApprovalDetails,
    claimStatus,
    setIsLoading,
    selectedClaim,
    triggerClaimRefresh,
  } = useGlobalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBerModalOpen, setIsBerModalOpen] = useState(false);
  const { notifySuccess, notifyError } = useNotification();
  const [inlineLoader, setInlineLoader] = useState(false);

  const berOptions = ["repair", "settle"];
  const approvedStatuses = [
    "Approved",
    "BER Approved",
    "BER Replacement Approved",
    "BER Repair Approved",
  ];
  const isApprovedStatus = approvedStatuses.includes(claimStatus);

  // this will execute in background
  useEffect(() => {
    if (selectedClaim) {
      setApprovalDetails({
        estimateAmount: Number(selectedClaim?.claimed_amount),
        approvedAmount: Number(selectedClaim?.approved_amount),
        approvalType: selectedClaim?.status,
        approvalDate: selectedClaim?.approval_date,
        repairAmount: selectedClaim?.repair_amount,
        repairPaymentSuccessful: selectedClaim?.repair_payment_successful,
        repairPaymentLink: selectedClaim?.repair_payment_link,
        repairRazorpayOrderId: selectedClaim?.repair_razorpay_order_id,
        estimateDate: selectedClaim?.estimated_date,
        replacementPaymentSuccessful:
          selectedClaim?.data?.replacement_payment?.replace_payment_successful,
        replacementPaymentLink:
          selectedClaim?.data?.replacement_payment?.replace_payment_link,
        replacementAmount:
          selectedClaim?.data?.replacement_payment?.replace_amount,
        pickupTracking: selectedClaim?.pickup_tracking,
        is_tvs_claim: selectedClaim?.is_tvs_claim ?? false,
        customer_pickup_details: selectedClaim?.customer_pickup_details,
      });
    }
  }, [selectedClaim, setApprovalDetails]);

  // Handle BER Decision Selection
  const handleBerSelection = (val: string) => {
    setApprovalDetails({ berDecision: val, deviceAmount: "" });
    if (val != "replace") {
      setIsBerModalOpen(true);
    }
    setErrorMessage(null);
  };

  // Handle Device Amount Input Change
  const handleDeviceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numeric values
    if (!/^\d*$/.test(inputValue)) return;

    setApprovalDetails({ deviceAmount: inputValue });
    setErrorMessage(null);
  };

  // Validate Input When User Leaves the Field
  const handleDeviceAmountBlur = () => {
    const numericValue = Number(approvalDetails.deviceAmount);

    if (numericValue < 0) {
      setErrorMessage(`Device amount cannot be less than ₹ 0`);
    } else {
      setErrorMessage(null);
    }
  };

  // Submit Handler
  const handleSubmit = () => {
    if (
      errorMessage ||
      !approvalDetails.berDecision ||
      !approvalDetails?.deviceAmount
    )
      return;

    setIsSubmitting(true);
    if (approvalDetails.berDecision === "replace") {
      setIsBerModalOpen(true);
    }
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const handleBerSubmit = async () => {
    setIsBerModalOpen(false);
    if (approvalDetails.berDecision != "replace") {
      try {
        setIsLoading(true);
        const response = await handleBerDecision(
          Number(selectedClaim?.id),
          String(approvalDetails.berDecision)
        );

        if (!response?.success) {
          notifyError("Failed to update Ber Decision !");
        } else {
          if (approvalDetails.berDecision === "repair") {
            handleGenerateLink("CLAIM_REPAIR");
          } else {
            triggerClaimRefresh();
          }
          notifySuccess("Ber Decision Successfully updated !");
        }
      } catch (error) {
        notifyError(`Failed to update Ber Decision ! ${error}`);
      } finally {
        if (approvalDetails.berDecision == "settle") {
          setIsLoading(false);
        }
      }
    }

    // replace
    if (approvalDetails.berDecision === "replace") {
      try {
        setIsLoading(true);
        const response = await handleBerDecision(
          Number(selectedClaim?.id),
          String(approvalDetails.berDecision),
          String(approvalDetails?.deviceAmount)
        );

        if (!response?.success) {
          notifyError("Failed to update Ber Decision !");
        } else {
          handleGenerateLink("CLAIM_REPLACE");
          // triggerClaimRefresh();
          notifySuccess("Ber Decision Successfully updated !");
        }
      } catch (error) {
        notifyError(`Failed to update Ber Decision ! ${error}`);
      } finally {
        // setIsLoading(false);
      }
    }
  };

  // Disable Submit Button Conditions
  const isSubmitDisabled =
    isSubmitting ||
    errorMessage !== null ||
    !approvalDetails.berDecision ||
    approvalDetails.deviceAmount === "";

  const handleGenerateLink = async (type: string) => {
    // setIsLoading(true);
    try {
      const response = await generatePaymentLink(
        Number(selectedClaim?.id),
        String(type),
        "claim"
      );

      if (!response.success) {
        notifyError("Failed to Generate Payment Link !");
      } else {
        triggerClaimRefresh();
        notifySuccess("Payment Link Successfully Generated! ");
      }
    } catch (error) {
      notifyError(`Failed to generate Payment link ! ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickupTracking = async (pickup_type: string) => {
    if (pickup_type == "ready") {
      try {
        setInlineLoader(true);
        setIsLoading(true);
        const response = await handlePickupTrackingStatus(
          Number(selectedClaim?.id),
          String(pickup_type)
        );

        if (!response.success) {
          notifyError("Failed to mark ready for pickup !");
        } else {
          triggerClaimRefresh();
          notifySuccess("Marked as ready for pickup ");
        }
      } catch (error) {
        notifyError(`Failed to mark ready for pickup ! ${error}`);
      } finally {
        setIsLoading(false);
        setInlineLoader(false);
      }
    }

    if (pickup_type == "picked") {
      try {
        setIsLoading(false);
        const response = await handlePickupTrackingStatus(
          Number(selectedClaim?.id),
          String(pickup_type)
        );

        if (!response.success) {
          notifyError("Failed to mark as picked up !");
        } else {
          triggerClaimRefresh();
          notifySuccess("Marked as picked up ");
        }
      } catch (error) {
        notifyError(`Failed to mark as picked up ! ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  console.log(isApprovedStatus, "===");
  console.log(approvalDetails);

  return (
    <div className="text-[#515151]">
      <h2 className="text-lg font-semibold mb-4">Details</h2>
      <div className="flex gap-8 flex-wrap">
        {/* estimate date */}
        {approvalDetails?.estimateDate && (
          <div className="pb-[10px] w-[45%]">
            <label className="block text-darkGray text-xs font-medium">
              Estimate Date
            </label>
            <p className="text-sm font-bold">
              {/* {convertDateTime(approvalDetails?.estimateDate)} */}
              {approvalDetails?.estimateDate}
            </p>
          </div>
        )}

        {/* Estimate Amount */}
        {approvalDetails.estimateAmount && (
          <div className="pb-[10px] w-[45%]">
            <label className="block text-darkGray text-xs font-medium">
              Estimate Amount
            </label>
            <p className="text-sm font-bold">
              ₹ {approvalDetails.estimateAmount}
            </p>
          </div>
        )}

        {/* approval date */}
        {approvalDetails?.approvalDate && (
          <div className="pb-[10px] w-[45%]">
            <label className="block text-darkGray text-xs font-medium">
              Approval Date
            </label>
            <p className="text-sm font-semibold">
              {/* {formatDate(approvalDetails?.approvalDate)} */}
              {formatToDateTime(approvalDetails?.approvalDate)}
            </p>
          </div>
        )}

        {/* Approved Amount */}
        <div className="pb-[10px] w-[45%]">
          <label className="block text-darkGray text-xs font-medium">
            Approved Amount
          </label>
          <p className="text-sm font-bold">
            ₹ {approvalDetails.approvedAmount}
          </p>
        </div>

        {/* Approval Type */}
        {approvalDetails.approvalType && (
          <div className="pb-[10px] w-[45%]">
            <label className="block text-darkGray text-xs font-medium">
              Approval Type
            </label>
            <p className="text-sm font-semibold">
              {approvalDetails.approvalType}
            </p>
          </div>
        )}

        {approvalDetails.repairAmount &&
          approvalDetails.repairPaymentSuccessful && (
            <div className="pb-[10px] w-[45%]">
              <label className="block text-darkGray text-xs font-medium">
                Partial Payment:
              </label>
              <p className="text-sm font-semibold text-[#23A047]">
                ₹ {approvalDetails.repairAmount} (Paid)
              </p>
            </div>
          )}

        {(claimStatus === "BER Repair" ||
          claimStatus === "Partially Approved") && (
          <div className="pb-[10px] w-[45%]">
            <label className="block text-darkGray text-xs font-medium">
              Partial Payment:
            </label>

            {!approvalDetails.repairPaymentSuccessful &&
            !approvalDetails.repairPaymentLink ? (
              <button
                className={`btn bg-primaryBlue text-white w-1/2 hover:bg-blue-700`}
                onClick={() => {
                  handleGenerateLink("CLAIM_REPAIR");
                }}
              >
                Generate Payment Link
              </button>
            ) : approvalDetails.repairAmount &&
              !approvalDetails.repairPaymentSuccessful ? (
              <>
                <p className="text-sm font-semibold text-[#CC4244]">
                  ₹ {approvalDetails.repairAmount} (Pending)
                </p>
                {approvalDetails.repairPaymentLink && (
                  <p className="flex justify-start gap-1 items-center text-xs text-[#5C5C5C] font-semibold mt-2">
                    <span>Payment Link: </span>
                    <Link
                      className="text-xs text-[#3C63FC]"
                      href={String(approvalDetails.repairPaymentLink)}
                      target="_blank"
                    >
                      {approvalDetails.repairPaymentLink}
                    </Link>
                    <CopyToClipboardButton
                      text={String(approvalDetails.repairPaymentLink)}
                    />
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-semibold text-[#23A047]">
                ₹ {approvalDetails.repairAmount} (Paid)
              </p>
            )}
          </div>
        )}

        {/* replacement payments */}

        {claimStatus === "BER Replace" && (
          <div className="pb-[10px] w-[45%]">
            <label className="block text-darkGray text-xs font-medium">
              Partial Payment:
            </label>

            {!approvalDetails.replacementPaymentSuccessful &&
            !approvalDetails.replacementPaymentLink ? (
              <button
                className={`btn bg-primaryBlue text-white w-1/2 hover:bg-blue-700`}
                onClick={() => {
                  handleGenerateLink("CLAIM_REPLACE");
                }}
              >
                Generate Payment Link
              </button>
            ) : approvalDetails.replacementAmount &&
              !approvalDetails.replacementPaymentSuccessful ? (
              <>
                <p className="text-sm font-semibold text-[#CC4244]">
                  ₹ {approvalDetails.replacementAmount} (Pending)
                </p>
                {approvalDetails.replacementPaymentLink && (
                  <p className="flex justify-start gap-1 items-center text-xs text-[#5C5C5C] font-semibold mt-2">
                    <span>Payment Link: </span>
                    <Link
                      className="text-xs text-[#3C63FC]"
                      href={String(approvalDetails.replacementPaymentLink)}
                      target="_blank"
                    >
                      {approvalDetails.replacementPaymentLink}
                    </Link>
                    <CopyToClipboardButton
                      text={String(approvalDetails.replacementPaymentLink)}
                    />
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-semibold text-[#23A047]">
                ₹ {approvalDetails.replacementAmount} (Paid)
              </p>
            )}
          </div>
        )}

        {/* BER Decision Dropdown */}
        {approvalDetails.approvalType != "Approved" &&
          claimStatus === "BER Marked" && (
            <div className="pb-[10px] w-[45%]">
              <label className="block text-darkGray text-xs font-medium">
                BER Decision
              </label>
              <CustomSelect
                options={berOptions}
                onChange={handleBerSelection}
                className="border-[#D5D7DA] text-[#181D27] h-[50px]"
                fontSize="text-sm"
                width="w-1/2"
              />
            </div>
          )}

        {/* Conditionally show Device Amount Input only when BER Decision is replace */}
        {approvalDetails.berDecision == "replace" &&
          claimStatus === "BER Marked" && (
            <div className="pb-[10px] w-[45%]">
              <label className="block text-darkGray text-xs font-medium">
                Add Device Amount *
              </label>
              <input
                type="text"
                className={`w-full border px-4 py-2 rounded-md text-sm bg-inputBg text-[#181D27] focus:outline-none hover:bg-gray-100 h-[45px] ${
                  errorMessage ? "border-red-500" : "border-gray-300"
                }`}
                value={approvalDetails.deviceAmount}
                onChange={handleDeviceAmountChange}
                onBlur={handleDeviceAmountBlur}
              />
              {errorMessage && (
                <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
              )}
            </div>
          )}

        {/* Submit Button */}
        {approvalDetails.berDecision == "replace" &&
          claimStatus === "BER Marked" && (
            <div className="pb-[10px] w-[45%]">
              <button
                className={`w-1/2 px-4 py-2 rounded-md text-white text-sm font-semibold ${
                  isSubmitDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } h-[45px]`}
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Submit
              </button>
            </div>
          )}
        {/* pickup tracking section  */}
        {approvalDetails?.is_tvs_claim &&
          isApprovedStatus &&
          approvalDetails?.customer_pickup_details != null &&
          approvalDetails?.pickupTracking?.is_readyfor_pickup != true && (
            <div className="pb-[10px] w-[45%]">
              <button
                className={`w-1/2 px-4 py-2 rounded-md text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 h-[45px]`}
                onClick={() => {
                  handlePickupTracking("ready");
                }}
              >
                {inlineLoader ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  <>Ready For Pickup</>
                )}
              </button>
            </div>
          )}
        {approvalDetails?.is_tvs_claim &&
          isApprovedStatus &&
          approvalDetails?.customer_pickup_details != null &&
          approvalDetails?.pickupTracking?.is_readyfor_pickup == true && (
            <div className="pb-[10px] w-[45%]">
              <button
                className={`w-1/2 px-4 py-2 rounded-md text-white text-sm font-semibold h-[45px] ${
                  !approvalDetails?.pickupTracking?.is_pickup_initiated == true
                    ? "bg-gray-400 cursor-not-allowed disabled"
                    : "bg-blue-600 hover:bg-blue-700"
                }
  `}
                disabled={
                  !approvalDetails?.pickupTracking?.is_pickup_initiated == true
                }
                onClick={() => {
                  handlePickupTracking("picked");
                }}
              >
                {inlineLoader ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  <>Mark As Picked</>
                )}
              </button>
            </div>
          )}
      </div>

      {/* modal */}
      {approvalDetails.berDecision === "repair" && (
        <BerRepairModal
          isOpen={isBerModalOpen}
          onClose={() => setIsBerModalOpen(false)}
          onSubmit={handleBerSubmit}
        />
      )}

      {approvalDetails.berDecision === "replace" && (
        <BerReplaceModal
          isOpen={isBerModalOpen}
          onClose={() => setIsBerModalOpen(false)}
          onSubmit={handleBerSubmit}
        />
      )}

      {approvalDetails.berDecision === "settle" && (
        <BerSettleModal
          isOpen={isBerModalOpen}
          onClose={() => setIsBerModalOpen(false)}
          onSubmit={handleBerSubmit}
        />
      )}
    </div>
  );
};

export default ApprovalDetailsTab;
