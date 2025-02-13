"use client";

import { useGlobalStore } from "@/store/store";
import CustomSelect from "@/components/ui/CustomSelect"; // Reusable Select Component
import { useState } from "react";

const ApprovalDetailsTab: React.FC = () => {
  const { approvalDetails, setApprovalDetails } = useGlobalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const berOptions = ["Repair Device", "Replace Device", "Settle"];

  // Handle BER Decision Selection
  const handleBerSelection = (val: string) => {
    setApprovalDetails({ berDecision: val, deviceAmount: "" }); // Reset device amount when changing selection
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

    if (numericValue < approvalDetails.approvedAmount) {
      setErrorMessage(
        `Device amount cannot be less than ₹ ${approvalDetails.approvedAmount}`
      );
    } else {
      setErrorMessage(null);
    }
  };

  // Submit Handler
  const handleSubmit = () => {
    if (errorMessage || !approvalDetails.berDecision) return;

    setIsSubmitting(true);
    console.log("Submitting Approval Details:", approvalDetails);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
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
        <div className="w-1/2 pr-[50px]">
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
            <p className="text-md font-semibold">
              {approvalDetails.approvalType}
            </p>
          </div>

          {/* Conditionally show Device Amount Input only when BER Decision is selected */}
          {approvalDetails.berDecision && (
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
          <div className="pb-[30px] w-1/2">
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
          <div className="pb-[30px] w-1/2">
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
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetailsTab;
