"use client";

import { ClaimDetailsProps } from "@/interfaces/ClaimInterface";

const ClaimDetailsTab: React.FC<ClaimDetailsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Claim Date */}
        <div>
          <h4 className="text-xs text-gray-500">Claim Date</h4>
          <p className="text-sm font-semibold">{data.claimDate}</p>
        </div>

        {/* Plan Type */}
        <div>
          <h4 className="text-xs text-gray-500">Plan Type</h4>
          <p className="text-sm font-semibold">{data.planType}</p>
        </div>

        {/* Claim Details */}
        <div>
          <h4 className="text-xs text-gray-500">Claim Details</h4>
          <p className="text-sm text-gray-700">{data.claimDetails}</p>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* IMEI */}
        <div>
          <h4 className="text-xs text-gray-500">IMEI</h4>
          <p className="text-sm font-semibold">{data.imei}</p>
        </div>

        {/* Co-pay */}
        <div>
          <h4 className="text-xs text-gray-500">CoPay</h4>
          <p className="text-sm font-semibold">{data.coPay.amount} </p>
        </div>

        {/* prefered service center */}
        <div>
          <h4 className="text-xs text-gray-500">Service Centre Name</h4>
          <p className="text-sm font-semibold">{data.service_centre_name} </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailsTab;
