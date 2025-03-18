"use client";

import { SettlementDetailsProps } from "@/interfaces/ClaimInterface";

const SettlementDetailsTab: React.FC<{ data: SettlementDetailsProps }> = ({
  data,
}) => {
  const { utr_number, payment_date, payment_amount } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Payment Date */}
        <div>
          <h4 className="text-xs text-gray-500">Payment Date</h4>
          <p className="text-sm font-semibold">{payment_date || "N/A"}</p>
        </div>

        {/* UTR Number */}
        <div>
          <h4 className="text-xs text-gray-500">UTR Number</h4>
          <p className="text-sm font-semibold">{utr_number || "N/A"}</p>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Payment Amount */}
        <div>
          <h4 className="text-xs text-gray-500">Payment Amount</h4>
          <p className="text-sm font-semibold">{payment_amount || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetailsTab;
