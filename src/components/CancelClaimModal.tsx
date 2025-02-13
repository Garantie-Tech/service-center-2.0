"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CustomSelect from "@/components/ui/CustomSelect";

interface CancelClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const CancelClaimModal: React.FC<CancelClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  // Handle fade-in and fade-out effect
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      setTimeout(() => setShowModal(false), 300); // Wait for animation to finish before removing
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason);
    onClose(); // Close modal after submission
  };

  if (!showModal) return null; // Don't render if modal is not open

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Modal Box */}
      <div
        className={`bg-white rounded-lg shadow-lg px-[30px] py-[40px] w-[410px] relative transform transition-all duration-300 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          onClick={onClose}
        >
          <Image
            src="/images/cross-square.svg"
            alt="Close"
            width={50}
            height={50}
          />
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-[70px] h-[70px] rounded-full bg-red-100 flex items-center justify-center">
            <Image
              src="/images/red-cross-bg.svg"
              alt="Cancel Icon"
              width={30}
              height={30}
              className="absolute w-[60px] h-[60px]"
            />
            <Image
              src="/images/red-cross.svg"
              alt="Cancel Icon"
              width={30}
              height={30}
              className="relative w-[30px] h-[30px]"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold mt-4 text-[#181D27]">
          Cancel Claim
        </h2>

        {/* Subtitle */}
        <p className="text-center text-base text-[#414651] font-medium my-4">
          Are you sure? You are cancel the claim <br />
          please select reason!
        </p>

        {/* Select Dropdown */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1 text-[#414651]">
            Select Reason
          </label>

          <CustomSelect
            options={[
              "Duplicate Claim",
              "Incorrect Details",
              "No Longer Needed",
            ]}
            placeholder="Select"
            onChange={(value) => setSelectedReason(value)}
            className="border-[#D5D7DA] text-[#181D27] h-[50px]"
            fontSize="text-base"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between gap-6 text-base font-semibold">
          <button
            className="w-1/2 border border-gray-300 px-4 py-2 rounded-md text-[#414651] hover:bg-gray-100 transition-all duration-200 h-[50px]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`w-1/2 h-[50px] px-4 py-2 rounded-md text-white transition-all duration-200 ${
              selectedReason
                ? "bg-[#D92D20] hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!selectedReason}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelClaimModal;
