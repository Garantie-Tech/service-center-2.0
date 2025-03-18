"use client";

import React from "react";

interface RejectedClaimProps {
  data: {
    rejectedReason: string | undefined;
    copayRefunded?: boolean;
    copayRefundedDate?: string;
    copayRefundedId?: string;
    copayRefundedAmount?: string | number;
  };
}

const RejectedClaim: React.FC<RejectedClaimProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-y-8 pb-[100px]">
      {/*Reason */}
      <div>
        <p className="text-gray-500 text-xs">Reason</p>
        <p className="font-bold text-sm">{data?.rejectedReason}</p>
      </div>

      {/* Copay Refunded date */}
      {data?.copayRefundedDate && (
        <div>
          <p className="text-gray-500 text-xs">Copay Refund Date</p>
          <p className="font-bold text-sm">{data?.copayRefundedDate}</p>
        </div>
      )}

      {/* Copay Refunded id */}
      {data?.copayRefundedId && (
        <div>
          <p className="text-gray-500 text-xs">Copay Refund Id</p>
          <p className="font-bold text-sm">{data?.copayRefundedId}</p>
        </div>
      )}

      {/* Copay Refunded amount */}
      {data?.copayRefundedAmount && (
        <div>
          <p className="text-gray-500 text-xs">Copay Refund Amount</p>
          <p className="font-bold text-sm">{data?.copayRefundedAmount}</p>
        </div>
      )}
    </div>
  );
};

export default RejectedClaim;
