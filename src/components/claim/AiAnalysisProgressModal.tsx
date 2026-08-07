"use client";

import { useEffect, useState } from "react";
import { runRepairInvoiceAnalysis } from "@/services/aiAnalysisService";

type TransferStatus = "idle" | "transferring" | "completed";

interface AiAnalysisProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementAmount?: string | number;
  onSettled?: () => void;
}

const AiAnalysisProgressModal: React.FC<AiAnalysisProgressModalProps> = ({
  isOpen,
  onClose,
  settlementAmount,
  onSettled,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [transferStatus, setTransferStatus] = useState<TransferStatus>("idle");
  const [utrNumber, setUtrNumber] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setShowModal(false), 300);
      return;
    }

    setShowModal(true);
    setAnalysisDone(false);
    setTransferStatus("idle");
    setUtrNumber("");

    let cancelled = false;

    runRepairInvoiceAnalysis(() => {}).then(() => {
      if (cancelled) return;
      setAnalysisDone(true);
      setTimeout(() => {
        if (cancelled) return;
        setTransferStatus("transferring");
        setTimeout(() => {
          if (cancelled) return;
          setUtrNumber(
            `UTR${Date.now().toString().slice(-9)}${Math.floor(
              10 + Math.random() * 90,
            )}`,
          );
          setTransferStatus("completed");
          onSettled?.();
        }, 3200);
      }, 600);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg px-[30px] py-[35px] w-[460px] relative transform transition-all duration-300 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Section 1: AI Analysis */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#181D27]">
              AI Analysis
            </h2>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-md border border-[#EEEEEE] px-3 py-2.5">
            {analysisDone ? (
              <div className="w-5 h-5 rounded-full bg-[#19AD61] flex items-center justify-center shrink-0">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-[#D5D7DA] border-t-primaryBlue animate-spin shrink-0" />
            )}
            <span
              className={`text-sm ${
                analysisDone ? "text-[#181D27]" : "text-gray-500"
              }`}
            >
              {analysisDone
                ? "Repair invoice validated successfully."
                : "Validating the AI Analysis Invoice..."}
            </span>
          </div>
        </div>

        {/* Section 2: Payment transfer to service centre */}
        {analysisDone && (
          <div className="mt-5 border-t border-[#EEEEEE] pt-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#181D27]">
                Payment Transfer
              </h2>
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-md border border-[#EEEEEE] px-3 py-2.5">
              {transferStatus === "completed" ? (
                <div className="w-5 h-5 rounded-full bg-[#19AD61] flex items-center justify-center shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#D5D7DA] border-t-primaryBlue animate-spin shrink-0" />
              )}
              <span
                className={`text-sm ${
                  transferStatus === "completed"
                    ? "text-[#181D27]"
                    : "text-gray-500"
                }`}
              >
                {transferStatus === "completed"
                  ? "Amount transferred to the service centre account."
                  : "Transferring payment to service centre account..."}
              </span>
            </div>

            {transferStatus === "completed" && (
              <div className="mt-3 space-y-3 rounded-md bg-[#F9FAFB] border border-[#EEEEEE] px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-[#181D27]">
                    ₹ {settlementAmount ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">UTR Number</span>
                  <span className="font-semibold text-[#181D27]">
                    {utrNumber}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {transferStatus === "completed" && (
          <button
            type="button"
            className="btn w-full bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-6 h-[46px] rounded-md"
            onClick={onClose}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default AiAnalysisProgressModal;
