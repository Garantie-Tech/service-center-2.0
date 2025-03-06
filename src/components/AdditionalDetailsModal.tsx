"use client";

import Image from "next/image";

interface AdditionalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdditionalDetailsModal: React.FC<AdditionalDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
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
          <div className="grid grid-cols-2 gap-y-4 text-sm pb-[100px]">
            {/* Claim Date */}
            <div>
              <p className="text-gray-500">Claim Date</p>
              <p className="font-bold">02-01-2025</p>
            </div>

            {/* Plan Type */}
            <div>
              <p className="text-gray-500">Plan Type</p>
              <p className="font-bold">CDP</p>
            </div>

            {/* SRN Number */}
            <div>
              <p className="text-gray-500">SRN No</p>
              <p className="font-bold">18956</p>
            </div>

            {/* Name */}
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-bold">Ram Kumar</p>
            </div>

            {/* IMEI Number */}
            <div>
              <p className="text-gray-500">IMEI</p>
              <p className="font-bold">816395305305395903</p>
            </div>

            {/* Co-Pay Amount */}
            <div>
              <p className="text-gray-500">Co-pay</p>
              <p className="font-bold">
                200 <span className="text-green-500">(Paid)</span>
              </p>
            </div>

            {/* Claim Details Section */}
            <div className="col-span-2 pb-[100px]">
              <p className="text-gray-500">Claim Details</p>
              <p className="mt-1">
                I was leaving for office in the morning when the bike from
                behind hit me, and I fell, and my phone got damaged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalDetailsModal;
