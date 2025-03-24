"use client";

import React from "react";

interface CancelledClaimProps {
  data: {
    cancelledBy: string | undefined;
    cancelledReason: string | undefined;
    copayRefunded?: boolean;
    copayRefundedDate?: string;
    copayRefundedId?: string;
    copayRefundedAmount?: string | number;
  };
}

const CancelledClaim: React.FC<CancelledClaimProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-y-8 pb-[100px]">
      {/* Canceled By */}
      <div>
        <p className="text-gray-500 text-xs">Cancelled By</p>
        <p className="font-bold text-sm">{data?.cancelledBy}</p>
      </div>

      {/* Canceled Reason */}
      <div>
        <p className="text-gray-500 text-xs">Cancelled Reason</p>
        <p className="font-bold text-sm">{data?.cancelledReason}</p>
      </div>

      {/* is Copay refunded */}
      {!data?.copayRefunded && (
        <div>
          <p className="text-gray-500 text-xs">Copay Refund Status</p>
          <p className="font-bold text-sm">Pending</p>
        </div>
      )}

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

export default CancelledClaim;
