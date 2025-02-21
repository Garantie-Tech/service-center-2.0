"use client";

import React from "react";

interface CancelledClaimProps {
  data: {
    cancelledBy: string | undefined;
    cancelledReason: string | undefined;
  };
}

const CancelledClaim: React.FC<CancelledClaimProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Cancelled By */}
        <div>
          <h4 className="text-xs text-gray-500">Cancelled By</h4>
          <p className="text-sm font-semibold">{data?.cancelledBy}</p>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Cancelled Reason */}
        <div>
          <h4 className="text-xs text-gray-500">Cancelled Reason</h4>
          <p className="text-sm font-semibold">{data?.cancelledReason}</p>
        </div>
      </div>
    </div>
  );
};

export default CancelledClaim;
