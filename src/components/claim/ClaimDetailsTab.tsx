"use client";

import { ClaimDetailsProps } from "@/interfaces/ClaimInterface";
import GalleryPopup from "../ui/GalleryPopup";
import { useState } from "react";
import TrackPopup from "../TrackPopup";
import Image from "next/image";

const ClaimDetailsTab: React.FC<ClaimDetailsProps> = ({ data }) => {
  const [showTrackingPopup, setShowTrackingPopup] = useState(false);
  const [trackingAwb, setTrackingAwb] = useState<string | null>(null);

  const showPickupDetailsSection =
    data?.pickup_details?.is_tvs_claim == true &&
    data?.pickup_details?.customer_pickup_details != null &&
    data?.shipping_info?.shipment_outbound_awb_number;

  const handleDownload = async (fileUrl: string): Promise<void> => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const parts = fileUrl.split(".");
      const lastPart = parts.pop();
      const ext = lastPart ? lastPart.split("?")[0] : "pdf";

      const fileName = `device_purchase_invoice.${ext}`;

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Unable to download file. Please try again later.");
    }
  };

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

          {/* Device purchase invoice */}
          {data?.device_purchase_invoice?.url && (
            <div>
              <h4 className="text-xs text-gray-500">Device Purchase Invoice</h4>
              <p className="text-sm font-semibold">
                <button
                  onClick={() =>
                    handleDownload(data?.device_purchase_invoice?.url ?? "")
                  }
                  className="tooltip tooltip-bottom bg-inputBg border border-[#EEEEEE] p-[5px]"
                  data-tip="Download Device Purchase Invoice"
                >
                  <Image
                    src="/images/pdf-icon.svg"
                    alt="Device Purchase Invoice"
                    width={30}
                    height={50}
                    className="h-[100%]"
                  />
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* pickup details */}
      {showPickupDetailsSection && (
        <div className="border-t py-[25px] border-[#e5e7eb] mt-[25px]">
          <div>
            <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
          </div>
          {/* pickup tracking */}
          <div className="p-[25px]">
            <div>
              <h2 className="text-md font-semibold mb-4">Pickup Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-8">
                {/* Address */}
                <div>
                  <h4 className="text-xs text-gray-500">Pickup Address</h4>
                  <p className="text-sm font-semibold">
                    {data?.shipping_info?.shipment_customer_address_line_one ??
                      "N/A"}
                  </p>
                </div>

                {/* Pincode */}
                <div>
                  <h4 className="text-xs text-gray-500">Pin code</h4>
                  <p className="text-sm font-semibold">
                    {data?.shipping_info?.shipment_customer_pincode ?? "N/A"}
                  </p>
                </div>

                {/* Alternate Mobile */}
                <div>
                  <h4 className="text-xs text-gray-500">
                    Alternate Mobile Number
                  </h4>
                  <p className="text-sm font-semibold">
                    {data?.shipping_info?.shipment_customer_alternate_phone
                      ? data?.shipping_info?.shipment_customer_alternate_phone
                      : "N/A"}
                  </p>
                </div>
                {/* AWB number */}
                <div>
                  <h4 className="text-xs text-gray-500">AWB Number</h4>
                  <p className="text-sm font-semibold">
                    {data?.shipping_info?.shipment_outbound_awb_number ?? "N/A"}
                  </p>
                </div>

                {/* tracking button */}
                {data?.shipping_info?.shipment_outbound_awb_number && (
                  <button
                    onClick={() => {
                      setTrackingAwb(
                        String(
                          data?.shipping_info?.shipment_outbound_awb_number
                        )
                      );
                      setShowTrackingPopup(true);
                    }}
                    className="bg-primaryBlue text-white px-4 py-2 rounded"
                  >
                    Track
                  </button>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Landmark */}
                <div>
                  <h4 className="text-xs text-gray-500">Nearest Landmark</h4>
                  <p className="text-sm font-semibold">
                    {data?.shipping_info?.shipment_customer_address_landmark
                      ? data?.shipping_info?.shipment_customer_address_landmark
                      : "N/A"}
                  </p>
                </div>

                {/* pickup images */}
                <div>
                  <h4 className="text-xs text-gray-500">Pickup Images</h4>
                  {data?.shipping_info?.pickup_photos ? (
                    <div className="flex justify-start align-center w-4/5 flex flex-wrap gap-2">
                      <GalleryPopup
                        images={data?.shipping_info?.pickup_photos}
                        allowRemoval={true}
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-semibold">{"N/A"}</p>
                  )}
                </div>

                {data?.shipping_info?.shipment_outbound_label_data && (
                  <div>
                    <h4 className="text-xs text-gray-500 mb-2">
                      Shipment Receipt
                    </h4>
                    <a
                      href={
                        data?.shipping_info?.shipment_outbound_label_data || ""
                      }
                      download={`pickup-shipping-receipt${data?.shipping_info?.shipment_claim_id}.jpg`}
                      className="tooltip tooltip-bottom bg-inputBg border border-[#EEEEEE] p-[5px]"
                      data-tip="Download Shipping Receipt"
                    >
                      <Image
                        src="/images/pdf-icon.svg"
                        alt="Estimate Upload"
                        width={30}
                        height={50}
                        className="h-[100%]"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* delivery tracking */}
          {data?.shipping_info?.shipment_inbound_awb_number && (
            <div className="p-[25px] pb-[50px]">
              <div>
                <h2 className="text-md font-semibold mb-4">Drop-off Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-8">
                  {/* Address */}
                  <div>
                    <h4 className="text-xs text-gray-500">Delivery Address</h4>
                    <p className="text-sm font-semibold">
                      {data?.shipping_info?.shipment_delivery_address_line_one
                        ? data?.shipping_info
                            ?.shipment_delivery_address_line_one
                        : "N/A"}
                    </p>
                  </div>

                  {/* Pincode */}
                  <div>
                    <h4 className="text-xs text-gray-500">Pincode</h4>
                    <p className="text-sm font-semibold">
                      {data?.shipping_info?.shipment_delivery_pincode ?? "N/A"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-500">AWB Number</h4>
                    <p className="text-sm font-semibold">
                      {data?.shipping_info?.shipment_inbound_awb_number ??
                        "N/A"}
                    </p>
                  </div>

                  {/* tracking button */}
                  {data?.shipping_info?.shipment_inbound_awb_number && (
                    <button
                      onClick={() => {
                        setTrackingAwb(
                          String(
                            data?.shipping_info?.shipment_inbound_awb_number
                          )
                        );
                        setShowTrackingPopup(true);
                      }}
                      className="bg-primaryBlue text-white px-4 py-2 rounded"
                    >
                      Track
                    </button>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Landmark */}
                  <div>
                    <h4 className="text-xs text-gray-500">Nearest Landmark</h4>
                    <p className="text-sm font-semibold">
                      {data?.shipping_info
                        ?.shipment_delivery_address_landmark ?? "N/A"}
                    </p>
                  </div>

                  {/* Alternate Mobile */}
                  <div>
                    <h4 className="text-xs text-gray-500">
                      Alternate Mobile Number
                    </h4>
                    <p className="text-sm font-semibold">
                      {data?.shipping_info?.shipment_delivery_alternate_phone
                        ? data?.shipping_info?.shipment_delivery_alternate_phone
                        : "N/A"}
                    </p>
                  </div>
                  {data?.shipping_info?.shipment_inbound_label_data && (
                    <div>
                      <h4 className="text-xs text-gray-500 mb-2">
                        Shipment Receipt
                      </h4>
                      <a
                        href={
                          data?.shipping_info?.shipment_inbound_label_data || ""
                        }
                        download={`delivery-shipping-receipt${data?.shipping_info?.shipment_claim_id}.jpg`}
                        className="tooltip tooltip-bottom bg-inputBg border border-[#EEEEEE] p-[5px]"
                        data-tip="Download Shipping Receipt"
                      >
                        <Image
                          src="/images/pdf-icon.svg"
                          alt="Estimate Upload"
                          width={30}
                          height={50}
                          className="h-[100%]"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showTrackingPopup && trackingAwb && (
        <TrackPopup
          awb={trackingAwb}
          onClose={() => setShowTrackingPopup(false)}
        />
      )}
    </div>
  );
};

export default ClaimDetailsTab;
