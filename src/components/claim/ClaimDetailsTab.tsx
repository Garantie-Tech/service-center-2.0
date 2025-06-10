"use client";

import { ClaimDetailsProps } from "@/interfaces/ClaimInterface";
import GalleryPopup from "../ui/GalleryPopup";

const ClaimDetailsTab: React.FC<ClaimDetailsProps> = ({ data }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Claim Date */}
          <div>
            <h4 className="text-xs text-gray-500">Claim Date</h4>
            <p className="text-sm font-semibold">{data.claimDate}</p>
          </div>

          {/* Damage Date */}
          <div>
            <h4 className="text-xs text-gray-500">Damage Date</h4>
            <p className="text-sm font-semibold">{data.damageDate}</p>
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
            <h4 className="text-xs text-gray-500">Copay Amount</h4>
            <p className="text-sm font-semibold">₹ {data.coPay.amount} </p>
          </div>

          {/* prefered service center */}
          <div>
            <h4 className="text-xs text-gray-500">Service Centre Name</h4>
            <p className="text-sm font-semibold">{data.service_centre_name} </p>
          </div>
        </div>
      </div>

      {/* pickup details */}
      {data?.pickup_details?.is_tvs_claim == true && (
        <div className="border-t py-[25px] border-[#e5e7eb] mt-[25px]">
          <div>
            <h2 className="text-lg font-semibold mb-4">Pickup Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-8">
              {/* Address */}
              <div>
                <h4 className="text-xs text-gray-500">Address</h4>
                <p className="text-sm font-semibold">
                  {data?.pickup_details?.customer_pickup_details
                    ?.pickup_address ?? "N/A"}
                </p>
              </div>

              {/* Pincode */}
              <div>
                <h4 className="text-xs text-gray-500">Pincode</h4>
                <p className="text-sm font-semibold">
                  {data?.pickup_details?.customer_pickup_details
                    ?.pickup_pincode ?? "N/A"}
                </p>
              </div>

              {/* Alternate Mobile */}
              <div>
                <h4 className="text-xs text-gray-500">Alternate Mobile</h4>
                <p className="text-sm font-semibold">
                  {data?.pickup_details?.customer_pickup_details
                    ?.pickup_alternate_mobile ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Landmark */}
              <div>
                <h4 className="text-xs text-gray-500">Landmark</h4>
                <p className="text-sm font-semibold">
                  {data?.pickup_details?.customer_pickup_details
                    ?.pickup_landmark ?? "N/A"}
                </p>
              </div>

              {/* pickup images */}
              <div>
                <h4 className="text-xs text-gray-500">Pickup Images</h4>
                {data?.pickup_details?.pickup_photos ? (
                  <div className="flex justify-start align-center w-4/5 flex flex-wrap gap-2">
                    <GalleryPopup
                      images={data?.pickup_details?.pickup_photos}
                      allowRemoval={true}
                    />
                  </div>
                ) : (
                  <p className="text-sm font-semibold">{"N/A"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimDetailsTab;
