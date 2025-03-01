"use client";

import React from "react";

interface RejectedClaimProps {
  data: {
    rejectedReason: string | undefined;
  };
}

const RejectedClaim: React.FC<RejectedClaimProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-8">
        <div>
          <h4 className="text-xs text-gray-500">Reason</h4>
          <p className="text-sm font-semibold">{data?.rejectedReason}</p>
        </div>
      </div>

      {/* Right Column */}
      {/* <div className="space-y-8">
        <div>
          <h4 className="text-xs text-gray-500">Cancelled Reason</h4>
          <p className="text-sm font-semibold">{data?.cancelledReason}</p>
        </div>
      </div> */}
    </div>
  );
};

export default RejectedClaim;
