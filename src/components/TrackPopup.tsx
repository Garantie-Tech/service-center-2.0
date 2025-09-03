"use client";

import { fetchTrackingDetails, TrackingData } from "@/services/track";
import React, { useEffect, useMemo, useState } from "react";

interface TrackPopupProps {
  awb: string;
  onClose: () => void;
}

const TrackPopup: React.FC<TrackPopupProps> = ({ awb, onClose }) => {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!awb) throw new Error("AWB number is missing.");
        const d = await fetchTrackingDetails(awb);
        if (mounted) setData(d);
      } catch (e: unknown) {
        if (mounted) {
          const message =
            e instanceof Error ? e.message : "Something went wrong.";
          setError(message);
          setData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [awb]);

  const scans = data?.scan_detail ?? [];

  // Timeline mapping per your screenshot
  const timelinePoints = useMemo(
    () => [
      {
        label: "Pickup Pending",
        keywords: ["Pickup scheduled", "Out for Pickup"],
      },
      { label: "Pickup Completed", keywords: ["Shipment picked up"] },
      { label: "In Transit", keywords: ["Vehicle Departed", "Trip Arrived"] },
      { label: "Out For Delivery", keywords: ["Out for delivery"] },
      { label: "Delivered", keywords: ["Delivered to consignee"] },
    ],
    []
  );

  // Find first matching scan for each point (in log order)
  const timelineEvents = useMemo(() => {
    return timelinePoints.map((point) => {
      const match = scans.find((s) =>
        point.keywords.some((k) => s.status.includes(k))
      );
      return { label: point.label, date: match?.date ?? null };
    });
  }, [scans, timelinePoints]);

  // Last completed checkpoint index
  const activeIdx = useMemo(
    () => timelineEvents.reduce((acc, e, i) => (e.date ? i : acc), -1),
    [timelineEvents]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg p-6 max-w-4xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Tracking Details</h2>
        <button
          className="absolute top-4 right-4 text-gray-500"
          onClick={onClose}
          aria-label="Close"
        >
          ✖
        </button>

        {loading && <p>Loading...</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && data && (
          <>
            {/* Header details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide">
                  AWB Number
                </div>
                <div className="text-sm font-semibold text-gray-900 break-all mt-1">
                  {data.awb_number}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Courier
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1">
                  {data.courier}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Status
                </div>
                <div
                  className={`text-sm font-semibold mt-1 ${
                    data.current_status === "CANCELLED"
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {data.current_status}
                </div>
              </div>
            </div>

            {/* Connected timeline */}
            <div className="mt-8 mb-6 w-full">
              <div className="flex justify-between items-start relative px-4">
                {timelineEvents.map((event, idx) => {
                  const isActive = idx <= activeIdx;
                  const isLast = idx === timelineEvents.length - 1;

                  return (
                    <div
                      key={event.label}
                      className="flex-1 flex flex-col items-center text-center relative"
                    >
                      {/* Circle */}
                      <div
                        className={`w-5 h-5 z-10 rounded-full border-2 flex items-center justify-center ${
                          isActive
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-gray-200 border-gray-300 text-gray-500"
                        }`}
                      >
                        {isActive ? "✓" : ""}
                      </div>

                      {/* Label */}
                      <div className="text-xs font-medium text-gray-800 mt-2 leading-tight">
                        {event.label}
                      </div>

                      {/* Date */}
                      <div className="text-[11px] text-gray-500 mt-1 whitespace-nowrap min-h-[32px] leading-snug">
                        {event.date ? (
                          <>
                            {new Date(event.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            <br />
                            {new Date(event.date).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </>
                        ) : (
                          "--"
                        )}
                      </div>

                      {/* Line */}
                      {!isLast && (
                        <div className="absolute top-2.5 left-1/2 w-full h-px">
                          <div
                            className={`w-full h-px ${
                              idx < activeIdx ? "bg-green-500" : "bg-gray-300"
                            } mx-auto`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scan History Table */}
            <div className="mt-8">
              <p className="font-semibold mb-2">Scan History:</p>
              {scans.length > 0 ? (
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Date Time</th>
                      <th className="p-2 border">Location</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((scan, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 border">
                          {new Date(scan.date).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="p-2 border">{scan.location}</td>
                        <td className="p-2 border">{scan.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">
                  No scan history available.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackPopup;
