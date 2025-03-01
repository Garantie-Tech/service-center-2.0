"use client";

import { useGlobalStore } from "@/store/store";
import CustomSelect from "@/components/ui/CustomSelect"; // Reusable Select Component
import { useState } from "react";
import BerRepairModal from "@/components/BerRepairModel";
import { useNotification } from "@/context/NotificationProvider";
import { handleBerDecision } from "@/services/claimService";
import Link from "next/link";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

const ApprovalDetailsTab: React.FC = () => {
  const {
    approvalDetails,
    setApprovalDetails,
    claimStatus,
    setIsLoading,
    selectedClaim,
  } = useGlobalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBerModalOpen, setIsBerModalOpen] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const berOptions = ["repair", "replace", "settle"];

  // Handle BER Decision Selection
  const handleBerSelection = (val: string) => {
    setApprovalDetails({ berDecision: val, deviceAmount: "" });
    setIsBerModalOpen(true);
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
    if (errorMessage || !approvalDetails.berDecision) return;
    console.log("Submitting Approval Details:", approvalDetails);

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const handleBerSubmit = async () => {
    setIsLoading(true);
    if (approvalDetails.berDecision != "Replace Device") {
      try {
        const response = await handleBerDecision(
          Number(selectedClaim?.id),
          String(approvalDetails.berDecision)
        );

        if (!response.success) {
          notifyError("Failed to update Ber Decision !");
        } else {
          notifySuccess("Ber Decision Successfully updated !");
        }
      } catch (error) {
        notifyError(`Failed to update Ber Decision ! ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
    setIsBerModalOpen(false);
  };

  // Disable Submit Button Conditions
  const isSubmitDisabled =
    isSubmitting ||
    errorMessage !== null ||
    !approvalDetails.berDecision ||
    approvalDetails.deviceAmount === "";

  return (
    <div className="text-[#515151]">
      <h2 className="text-lg font-semibold mb-4">Details</h2>
      <div className="flex gap-8">
        <div className="w-1/2 md:pr-[50px]">
          {/* Estimate Amount */}
          <div className="pb-[30px]">
            <label className="block text-darkGray text-xs font-medium">
              Estimate Amount
            </label>
            <p className="text-sm font-bold">
              ₹ {approvalDetails.estimateAmount}
            </p>
          </div>

          {/* Approval Type */}
          <div className="pb-[30px]">
            <label className="block text-darkGray text-xs font-medium">
              Approval Type
            </label>
            <p className="text-sm font-semibold">
              {approvalDetails.approvalType}
            </p>
          </div>

          {claimStatus == "BER Repair" && (
            <div className="pb-[30px]">
              <label className="block text-darkGray text-xs font-medium">
                Replacement Payment:
              </label>
              {approvalDetails.repairAmount &&
              !approvalDetails.repairPaymentSuccessful ? (
                <>
                  <p className="text-sm font-semibold text-[#CC4244]">
                    ₹ {approvalDetails.repairAmount}{" "}
                    {!approvalDetails.repairPaymentSuccessful
                      ? "(Pending)"
                      : ""}
                  </p>
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
                </>
              ) : (
                <p className="text-sm font-semibold text-[#23A047] font-semibold">
                  ₹ {approvalDetails.repairAmount}{" "}
                  {approvalDetails.repairPaymentSuccessful ? "(Paid)" : ""}
                </p>
              )}
            </div>
          )}

          {/* Conditionally show Device Amount Input only when BER Decision is Replace Device */}
          {approvalDetails.berDecision == "Replace Device" && (
            <div className="pb-[30px]">
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
          {approvalDetails.berDecision == "Replace Device" && (
            <div className="pb-[30px] md:w-1/2">
              <button
                className={`w-full px-4 py-2 rounded-md text-white text-sm font-semibold ${
                  isSubmitDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } h-[45px]`}
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          )}
        </div>

        <div className="w-1/2">
          {/* Approved Amount */}
          <div className="pb-[30px]">
            <label className="block text-darkGray text-xs font-medium">
              Approved Amount
            </label>
            <p className="text-sm font-bold">
              ₹ {approvalDetails.approvedAmount}
            </p>
          </div>

          {/* BER Decision Dropdown */}
          {approvalDetails.approvalType != "Approved" &&
            claimStatus === "BER Marked" && (
              <div className="pb-[30px] md:w-1/2">
                <label className="block text-darkGray text-xs font-medium">
                  BER Decision
                </label>
                <CustomSelect
                  options={berOptions}
                  onChange={handleBerSelection}
                  className="border-[#D5D7DA] text-[#181D27] h-[50px]"
                  fontSize="text-sm"
                />
              </div>
            )}

          {/* approval date */}
          {approvalDetails?.approvalDate && (
            <div className="pb-[30px]">
              <label className="block text-darkGray text-xs font-medium">
                Approval Date
              </label>
              <p className="text-sm font-semibold">
                {/* {formatDate(approvalDetails?.approvalDate)} */}
                {approvalDetails?.approvalDate}
              </p>
            </div>
          )}

          {/* <div className="pb-[30px]">
            <label className="block text-darkGray text-xs font-medium">
              BER Decision
            </label>
            <p className="text-sm font-semibold">
              {approvalDetails.approvalType}
            </p>
          </div> */}
        </div>
      </div>

      {/* modal */}
      <BerRepairModal
        isOpen={isBerModalOpen}
        onClose={() => setIsBerModalOpen(false)}
        onSubmit={handleBerSubmit}
      />
    </div>
  );
};

export default ApprovalDetailsTab;
