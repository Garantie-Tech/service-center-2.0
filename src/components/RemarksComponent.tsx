"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchRemarks } from "@/services/claimService";
import { useGlobalStore } from "@/store/store";
import { Remark } from "@/interfaces/GlobalInterface";

interface RemarksComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (remark: string) => void;
}

const RemarksComponent: React.FC<RemarksComponentProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedClaim } = useGlobalStore();
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    const getRemarks = async () => {
      if (!isOpen || !selectedClaim?.id) return;

      try {
        setIsLoading(true);
        const response = await fetchRemarks(Number(selectedClaim.id));

        if (
          response.success &&
          response.data &&
          Array.isArray(response?.data?.data?.items)
        ) {
          setRemarks(response?.data?.data?.items);
        } else {
          setRemarks([]);
        }
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
        setRemarks([]);
      } finally {
        setIsLoading(false);
      }
    };

    getRemarks();
    setRemark("");
  }, [isOpen, selectedClaim?.id]);

  const handleRemarksSubmit = async () => {
    try {
      setIsLoading(true);
      onSubmit(remark);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-xl font-semibold text-black">Remarks</h2>
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
        <div className="p-4 h-[80%] overflow-auto mb-[30px]">
          {!remarks || remarks.length === 0 ? (
            <p className="p-2 text-xs text-darkGray">No Remarks found</p>
          ) : (
            remarks.map((remark) => (
              <div key={remark.id} className="p-2">
                <p className="text-xs text-darkGray">{remark?.remark}</p>
                <p className="text-xs text-[#515151] font-semibold">
                  Added By: {remark?.added_by_platform} on {remark?.added_at}
                </p>
              </div>
            ))
          )}

          {/* form */}
          <div className="p-2">
            <p className="text-xs text-darkGray">Add Remark</p>

            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 resize-none text-sm"
              rows={3}
              placeholder="Add Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            ></textarea>

            {/* Buttons */}
            <div className="flex justify-start gap-3 mt-4">
              <button
                className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 text-base font-semibold"
                onClick={() => {
                  setRemark("");
                  onClose();
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-base font-semibold"
                disabled={!remark.trim()}
                onClick={() => {
                  handleRemarksSubmit();
                }}
              >
                {isLoading ? (
                  <div className="flex gap-2 align-center">
                    Adding{" "}
                    <span className="loading loading-spinner text-white"></span>
                  </div>
                ) : (
                  <> Add Remark</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemarksComponent;
