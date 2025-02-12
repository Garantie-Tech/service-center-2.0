"use client";

import { useGlobalStore } from "@/store/store";
import CustomSelect from "@/components/ui/CustomSelect"; // Reusable Select Component
import { useState } from "react";

const ApprovalDetailsTab: React.FC = () => {
  const { approvalDetails, setApprovalDetails } = useGlobalStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const berOptions = ["Repair Device", "Replace Device", "Settle"];

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log("Submitting Approval Details:", approvalDetails);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="text-[#515151]">
      <h2 className="text-lg font-semibold mb-4">Details</h2>
      <div className="flex gap-8">
        <div className="w-1/2">
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

          {/* Device Amount Input */}
          <div className="pb-[30px]">
            <label className="block text-darkGray text-xs font-medium">
              Add Device Amount *
            </label>
            <input
              type="text"
              className="w-full border px-4 py-2 rounded-md bg-gray-100 text-gray-700"
              value={approvalDetails.deviceAmount}
              onChange={(e) =>
                setApprovalDetails({ deviceAmount: e.target.value })
              }
            />
          </div>

          {/* submit button */}
          <div className="pb-[30px]">
            <button
              className={`w-full px-4 py-2 rounded-md text-white text-md ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting}
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

          {/* BER Decision */}
          <div className="pb-[30px]">
            <label className="block text-darkGray text-xs font-medium">
              BER Decision
            </label>
            <CustomSelect
              options={berOptions}
              value={approvalDetails.berDecision}
              onChange={(val) => setApprovalDetails({ berDecision: val })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetailsTab;
