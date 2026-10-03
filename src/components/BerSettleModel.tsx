"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BerSettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: {
    device_collected: "yes" | "no";
    accessory_provided: "yes" | "no";
  }) => void;
}

const BerSettleModal: React.FC<BerSettleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [deviceCollected, setDeviceCollected] = useState<"yes" | "no" | "">(
    "",
  );
  const [accessoryProvided, setAccessoryProvided] = useState<"yes" | "no" | "">(
    "",
  );

  // Handle fade-in and fade-out effect
  useEffect(() => {
    if (isOpen) {
      setDeviceCollected("");
      setAccessoryProvided("");
      setShowModal(true);
    } else {
      setTimeout(() => setShowModal(false), 300); // Wait for animation before unmounting
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!deviceCollected || !accessoryProvided) return;

    onSubmit({
      device_collected: deviceCollected,
      accessory_provided: accessoryProvided,
    });
    setDeviceCollected("");
    setAccessoryProvided("");
  };

  const handleClose = () => {
    setDeviceCollected("");
    setAccessoryProvided("");
    onClose();
  };

  if (!showModal) return null; // Don't render if modal is not open

  const canSubmit = !!deviceCollected && !!accessoryProvided;

  const renderRadioGroup = (
    label: string,
    value: "yes" | "no" | "",
    onChange: (value: "yes" | "no") => void,
  ) => (
    <div className="mt-4 text-left">
      <p className="text-sm font-semibold text-[#181D27] mb-2">
        {label} <span className="text-red-500">*</span>
      </p>
      <div className="flex gap-4">
        {(["yes", "no"] as const).map((option) => (
          <label
            key={option}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium cursor-pointer ${
              value === option
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 text-[#414651]"
            }`}
          >
            <input
              type="radio"
              className="radio checked:bg-primaryBlue w-[18px] h-[18px]"
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option === "yes" ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </div>
  );

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
          onClick={handleClose}
        >
          <Image
            src="/images/cross-square.svg"
            alt="Close"
            width={50}
            height={50}
          />
        </button>

        {/* Repair Icon */}
        <div className="flex justify-center">
          <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center">
            <Image
              src="/images/green-cross-bg.svg"
              alt="Repair Icon"
              width={60}
              height={60}
              className="absolute"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold mt-4 text-[#181D27]">
          BER Decision Confirmation
        </h2>

        {/* Subtitle */}
        <p className="text-center text-base text-[#414651] font-medium my-4">
          Are you sure? You are choosing to settle the device
        </p>

        {renderRadioGroup(
          "Is the device collected?",
          deviceCollected,
          setDeviceCollected,
        )}
        {renderRadioGroup(
          "Accessories provided?",
          accessoryProvided,
          setAccessoryProvided,
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-between gap-6 text-base font-semibold">
          <button
            className="w-1/2 border border-gray-300 px-4 py-2 rounded-md text-[#414651] hover:bg-gray-100 transition-all duration-200 h-[50px]"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className={`w-1/2 h-[50px] px-4 py-2 rounded-md text-white transition-all duration-200 ${
              canSubmit
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BerSettleModal;
