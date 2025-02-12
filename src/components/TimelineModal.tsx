"use client";

import { useState } from "react";
import Image from "next/image";

interface TimelineEvent {
  title: string;
  date: string;
  completed?: boolean;
}

const timelineData: TimelineEvent[] = [
  {
    title: "Claim Initiated",
    date: "08 January 2025, 11:00 AM",
    completed: true,
  },
  {
    title: "Claim Submitted",
    date: "10 January 2025, 10:00 PM",
    completed: true,
  },
  {
    title: "Document Verified",
    date: "10 January 2025, 11:00 AM",
    completed: true,
  },
  { title: "BER Decision", date: "10 January 2025, 11:00 AM", completed: true },
  {
    title: "Payment Link Generated",
    date: "11 January 2025, 11:00 AM",
    completed: true,
  },
  { title: "Payment Done", date: "11 January 2025, 11:00 AM", completed: true },
  {
    title: "Settlement Completed",
    date: "13 January 2025, 11:00 AM",
    completed: true,
  },
];

const TimelineModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
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
        className={`w-[400px] mt-[20px] h-[90vh] bg-white rounded-lg shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-black">Timeline</h2>
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

        {/* Timeline List */}
        <div className="p-6 relative overflow-y-auto h-[calc(100%-50px)]">
          <div className="relative">
            <ul className="timeline timeline-vertical">

              <li>
                <div className="timeline-start ">
                  First Macintosh computer
                </div>
                <div className="timeline-middle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="text-primaryBlue h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="timeline-end ">testing</div>
                <hr className="bg-primaryBlue w-[2px]"/>
              </li>

              <li>
                <hr className="bg-primaryBlue w-[2px]" />
                <div className="timeline-middle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="text-primaryBlue h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="timeline-end ">iMac</div>
                <hr className="bg-primaryBlue w-[2px]" />
              </li>

            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;
