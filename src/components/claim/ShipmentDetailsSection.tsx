"use client";

import Image from "next/image";
import { useGlobalStore } from "@/store/store";
import {
  handlePickupTrackingStatus,
  uploadFinalDocuments,
} from "@/services/claimService";
import { useNotification } from "@/context/NotificationProvider";
import { useState } from "react";
import { ShipmentDetailsSectionProps } from "@/interfaces/ClaimInterface";

const ShipmentDetailsSection: React.FC<ShipmentDetailsSectionProps> = ({
  isValidRepairMobilePhoto,
  repairedMobilePhotos,
}) => {
  const { selectedClaim, setIsLoading, triggerClaimRefresh, claimStatus } =
    useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();
  const [inlineLoader, setInlineLoader] = useState(false);

  const approvedStatuses = [
    "Approved",
    "BER Approved",
    "BER Replacement Approved",
    "BER Repair Approved",
    "BER Settlement Initiated",
    "BER Settlement Completed",
    "Settlement Initiated",
    "Settlement Completed",
  ];
  const isApprovedStatus = approvedStatuses.includes(claimStatus);

  const handlePickupTracking = async (pickup_type: string) => {
    if (pickup_type == "ready") {
      if (!repairedMobilePhotos || repairedMobilePhotos.length === 0) {
        notifyError(
          "Please upload repaired mobile image before marking as ready for pickup."
        );
        return;
      }
      try {
        setInlineLoader(true);
        setIsLoading(true);
        // Upload repaired mobile images before marking as ready
        const formData = new FormData();
        // Only upload repaired mobile images (doc type 74)
        repairedMobilePhotos.forEach((file) => {
          formData.append(`74[delete_existing_document]`, "1");
          formData.append(`74[document]`, file);
          formData.append(`74[document_type_id]`, "74");
        });
        const uploadResponse = await uploadFinalDocuments(
          Number(selectedClaim?.id),
          formData
        );
        if (!uploadResponse.data) {
          notifyError(
            "Failed to upload repaired mobile images. Please try again."
          );
          setIsLoading(false);
          setInlineLoader(false);
          return;
        }
        // Now mark as ready for pickup
        const response = await handlePickupTrackingStatus(
          Number(selectedClaim?.id),
          String(pickup_type)
        );

        if (!response.success) {
          notifyError("Failed to mark ready for pickup !");
        } else {
          triggerClaimRefresh();
          notifySuccess("Marked as ready for pickup ");
        }
      } catch (error) {
        notifyError(`Failed to mark ready for pickup ! ${error}`);
      } finally {
        setIsLoading(false);
        setInlineLoader(false);
      }
    }

    if (pickup_type == "picked") {
      try {
        setIsLoading(true);
        const response = await handlePickupTrackingStatus(
          Number(selectedClaim?.id),
          String(pickup_type)
        );

        if (!response.success) {
          notifyError("Failed to mark as picked up !");
        } else {
          triggerClaimRefresh();
          notifySuccess("Marked as picked up ");
        }
      } catch (error) {
        notifyError(`Failed to mark as picked up ! ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const readyToPickupStatus =
    selectedClaim?.is_tvs_claim &&
    isApprovedStatus &&
    selectedClaim?.customer_pickup_details != null &&
    selectedClaim?.pickup_tracking?.is_readyfor_pickup != true;

  const isShipmentInitiated =
    selectedClaim?.is_tvs_claim &&
    isApprovedStatus &&
    selectedClaim?.customer_pickup_details != null &&
    selectedClaim?.pickup_tracking?.is_readyfor_pickup == true &&
    selectedClaim?.pickup_tracking?.is_picked != true;

  const isShipmentCompleted =
    selectedClaim?.is_tvs_claim &&
    isApprovedStatus &&
    selectedClaim?.pickup_tracking != null &&
    selectedClaim?.pickup_tracking?.is_picked == true &&
    selectedClaim?.shipping_info?.shipment_inbound_label_data != null;

  if (!selectedClaim?.is_tvs_claim) return null;

  return (
    <div className="text-[#515151]">
      <div className="flex gap-8 flex-wrap">
        {isShipmentCompleted == true && (
          <div className="pb-[10px] w-[45%]">
            <h3 className="text-sm font-medium mb-2">Status</h3>
            <p className="text-sm font-bold">
              {readyToPickupStatus == true ? (
                <>Ready For Pickup</>
              ) : isShipmentInitiated == true ? (
                <>Pickup Initiated</>
              ) : isShipmentCompleted == true ? (
                <>Shipment Completed</>
              ) : (
                <>Pending</>
              )}
            </p>
          </div>
        )}
        {/* pickup initiated */}
        {isShipmentInitiated && isValidRepairMobilePhoto && (
          <div className="pb-[10px] w-[45%]">
            <h3 className="text-sm font-medium mb-2">Action</h3>
            <div className="flex items-center gap-4 mt-4">
              {selectedClaim?.shipping_info?.shipment_inbound_label_data && (
                <div>
                  <a
                    href={
                      selectedClaim?.shipping_info
                        ?.shipment_inbound_label_data || ""
                    }
                    download="shipping-receipt.jpg"
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

              <button
                className={`px-4 py-2 rounded-md text-white text-sm font-semibold h-[45px] ${
                  !selectedClaim?.pickup_tracking?.is_pickup_initiated == true
                    ? "bg-gray-400 cursor-not-allowed disabled"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={
                  !selectedClaim?.pickup_tracking?.is_pickup_initiated == true
                }
                onClick={() => {
                  handlePickupTracking("picked");
                }}
              >
                {inlineLoader &&
                selectedClaim?.shipping_info?.shipment_inbound_label_data ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  <>Mark As Picked</>
                )}
              </button>
            </div>
          </div>
        )}
        {/* shipment completed */}
        {isShipmentCompleted && (
          <div className="pb-[10px] w-[45%]">
            <h3 className="text-sm font-medium mb-2">Shipment Receipt</h3>
            <div className="flex items-center gap-2 mt-4">
              <a
                href={
                  selectedClaim?.shipping_info?.shipment_inbound_label_data ||
                  ""
                }
                download="shipping-receipt.jpg"
                className="tooltip tooltip-bottom bg-inputBg border border-[#EEEEEE] p-[5px]"
                data-tip="Download Shipping Receipt"
              >
                <Image
                  src="/images/pdf-icon.svg"
                  alt="Estimate Upload"
                  width={40}
                  height={60}
                  className="h-[100%]"
                />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetailsSection;
