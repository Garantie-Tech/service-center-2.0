"use client";

import { useState } from "react";
import Image from "next/image";
import TimelineModal from "@/components/TimelineModal";
import CancelClaimModal from "@/components/CancelClaimModal";
import AdditionalDetailsModal from "./AdditionalDetailsModal";
import { useGlobalStore } from "@/store/store";
import { useNotification } from "@/context/NotificationProvider";
import { handleCancelClaim } from "@/services/claimService";

const ClaimActionsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);
  const { selectedClaim, setActiveTab, setIsLoading } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const openTimeline = () => {
    setIsOpen(false);
    setShowTimeline(true);
  };
  const closeTimeline = () => setShowTimeline(false);

  const handleCancelClaimFn = async (reason: string) => {
    console.log("Canceling claim for reason:", reason);

    try {
      setIsLoading(true);

      // API Call to submit cancellation reason
      const response = await handleCancelClaim(
        Number(selectedClaim?.id),
        String(reason)
      );

      if (!response.data) {
        notifyError("Failed to cancel the claim. Please try again.");
      } else {
        notifySuccess("Claim cancelled successfully!");
      }
    } catch (error) {
      console.error("Error cancelling claim:", error);
      notifyError("An error occurred while cancelling the claim.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative text-xs text-gray-600">
      {/* Three dots button */}
      <button title="More Options" onClick={toggleDropdown}>
        <Image
          src="/images/three-dots.svg"
          alt="More Options"
          width={24}
          height={5}
          className="cursor-pointer"
          style={{ height: "20px" }}
        />
      </button>
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50">
          <ul className="py-4">
            <li
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => openTimeline()}
            >
              <Image
                src="/images/calender-dark.svg"
                alt="Timeline"
                width={20}
                height={20}
                className="mr-2"
              />
              Time Line
            </li>
            {selectedClaim?.revisable && (
              <li
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                onClick={() => setActiveTab("Estimate")}
              >
                <Image
                  src="/images/reload-dark.svg"
                  alt="Revise"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Revise Estimate
              </li>
            )}
            {selectedClaim?.cancellable && (
              <li
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                onClick={() => setIsCancelModalOpen(true)}
              >
                <Image
                  src="/images/cross-dark.svg"
                  alt="Cancel"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Cancel Claim
              </li>
            )}
            <li
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => setIsAdditionalModalOpen(true)}
            >
              <Image
                src="/images/calender-dark.svg"
                alt="Info"
                width={20}
                height={20}
                className="mr-2"
              />
              Additional Info
            </li>
          </ul>
        </div>
      )}
      <TimelineModal isOpen={showTimeline} onClose={closeTimeline} />
      <CancelClaimModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSubmit={handleCancelClaimFn} // Calls API when submitting reason
      />
      <AdditionalDetailsModal
        isOpen={isAdditionalModalOpen}
        onClose={() => setIsAdditionalModalOpen(false)}
      />
    </div>
  );
};

export default ClaimActionsDropdown;
