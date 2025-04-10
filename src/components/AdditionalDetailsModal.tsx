"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";

interface AdditionalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdditionalDetailsModal: React.FC<AdditionalDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedClaim } = useGlobalStore();

  return (
    <div
      className={`fixed inset-0 flex justify-end z-50 transition-all duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Overlay Background */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar Modal (Full Height, 90% of the screen height) */}
      <div
        className={`w-[450px] mt-[230px] h-[calc(100vh-230px)] bg-white rounded-lg shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-black">
            Additional Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <Image
              src="/images/cross-square.svg"
              alt="Close"
              width={50}
              height={50}
            />
          </button>
        </div>

        {/* Details Section */}
        <div className="p-6 overflow-y-auto h-[calc(100%-100px)]">
          <div className="grid grid-cols-2 gap-y-8 pb-[100px]">
            {/* Plan Number */}
            <div>
              <p className="text-gray-500 text-xs">Plan Number</p>
              <p className="font-bold text-sm">{selectedClaim?.plan_number}</p>
            </div>

            {/* Start Date */}
            <div>
              <p className="text-gray-500 text-xs">Start Date</p>
              <p className="font-bold text-sm">
                {selectedClaim?.plan_start_date}
              </p>
            </div>

            {/* Model Name */}
            <div>
              <p className="text-gray-500 text-xs">Model Name</p>
              <p className="font-bold text-sm">{selectedClaim?.model_name}</p>
            </div>

            {/* End Date */}
            <div>
              <p className="text-gray-500 text-xs">End Date</p>
              <p className="font-bold text-sm">
                {selectedClaim?.plan_end_date}
              </p>
            </div>

            {/* Model Price */}
            <div>
              <p className="text-gray-500 text-xs">Model Price</p>
              <p className="font-bold text-sm">
                ₹ {selectedClaim?.model_price}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalDetailsModal;
