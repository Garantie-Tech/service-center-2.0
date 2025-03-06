"use client";

import Image from "next/image";
import { CheckmarkIcon } from "@/components/icons/Icons";
import { useEffect, useState } from "react";
import { fetchTimeline } from "@/services/claimService";
import { useGlobalStore } from "@/store/store";
import { TimelineEvent } from "@/interfaces/GlobalInterface";

const TimelineModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [claimTimeline, setClaimTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedClaim } = useGlobalStore();

  useEffect(() => {
    const getClaimTimeline = async () => {
      if (!isOpen || !selectedClaim?.id) return;

      try {
        setIsLoading(true);
        const response = await fetchTimeline(Number(selectedClaim.id));

        if (
          response.success &&
          response.data &&
          Array.isArray(response.data.data)
        ) {
          setClaimTimeline(response.data.data);
        } else {
          setClaimTimeline([]);
        }
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
        setClaimTimeline([]);
      } finally {
        setIsLoading(false);
      }
    };

    getClaimTimeline();
  }, [isOpen, selectedClaim?.id]);

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
        className={`w-[450px] mt-[230px] h-[95vh] bg-white rounded-lg shadow-lg transform transition-transform duration-300 ${
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
        <div className="p-4 overflow-auto mb-[30px]">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading timeline...</p>
          ) : claimTimeline && claimTimeline.length > 0 ? (
            <ul className="timeline timeline-vertical">
              {claimTimeline.map((event, index) => (
                <li key={index}>
                  {index !== 0 && <hr className="bg-[#3C63FC]"/>}
                  <div className="timeline-start">
                    {event?.time || "No time available"}
                  </div>
                  <div className="timeline-middle px-[10px]">
                    <CheckmarkIcon />
                  </div>
                  <div className="timeline-end timeline-box">
                    {event?.label || "No label"}
                  </div>
                  {index !== claimTimeline.length - 1 && <hr className="bg-[#3C63FC]" />}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No timeline data found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;
