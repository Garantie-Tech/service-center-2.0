"use client";

import Image from "next/image";
import { useGlobalStore } from "@/store/store";
import { handlePickupTrackingStatus } from "@/services/claimService";
import { useNotification } from "@/context/NotificationProvider";
import { useState } from "react";
import { ShipmentDetailsSectionProps } from "@/interfaces/ClaimInterface";

interface RepairedMobileSectionPropsWithPickup
  extends ShipmentDetailsSectionProps {
  isMinThreeRepairImageRequired: boolean;
  isInvalidRepairMobilePhotoStatus: boolean | null;
}

const ShipmentDetailsSection: React.FC<
  RepairedMobileSectionPropsWithPickup
> = ({ isValidRepairMobilePhoto, isInvalidRepairMobilePhotoStatus }) => {
  const { selectedClaim, setIsLoading, triggerClaimRefresh, claimStatus } =
    useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();
  const [inlineLoader] = useState(false);

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
  const isApprovedStatus =
    approvedStatuses.includes(claimStatus) &&
    isInvalidRepairMobilePhotoStatus == true;

  const handlePickupTracking = async (pickup_type: string) => {
    if (pickup_type == "ready") {
      if (!isValidRepairMobilePhoto) {
        notifyError(
          "Please upload repaired mobile image before marking as ready for pickup."
        );
        return;
      }
      try {
        setIsLoading(true);
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
    selectedClaim?.available_for_pickup &&
    isApprovedStatus &&
    selectedClaim?.customer_pickup_details != null &&
    selectedClaim?.pickup_tracking?.is_readyfor_pickup == true &&
    selectedClaim?.pickup_tracking?.is_picked == false;

  const isShipmentInitiated =
    selectedClaim?.available_for_pickup &&
    isApprovedStatus &&
    selectedClaim?.customer_pickup_details != null &&
    selectedClaim?.pickup_tracking?.is_readyfor_pickup == true &&
    selectedClaim?.pickup_tracking?.is_picked != true;

  const isShipmentCompleted =
    selectedClaim?.available_for_pickup &&
    isApprovedStatus &&
    selectedClaim?.pickup_tracking != null &&
    selectedClaim?.pickup_tracking?.is_picked == true &&
    selectedClaim?.shipping_info?.shipment_inbound_label_data != null;

  if (!selectedClaim?.available_for_pickup) return null;

  return (
    <div className="text-[#515151]">
      <div className="flex gap-8 w-full">
        <div className="flex gap-4 w-full">
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
                <>Pickup Pending</>
              )}
            </p>
          </div>

          {/* ready for pickup */}
          {selectedClaim?.available_for_pickup &&
            selectedClaim?.customer_pickup_details != null &&
            isInvalidRepairMobilePhotoStatus == true &&
            selectedClaim?.pickup_tracking?.is_readyfor_pickup != true && (
              <div className="pb-[10px] w-[45%]">
                <button
                  className="btn w-full bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
                  onClick={async () => {
                    await handlePickupTracking("ready");
                  }}
                >
                  Ready For Pickup
                </button>
              </div>
            )}

          {/* pickup initiated */}
          {isShipmentInitiated && isInvalidRepairMobilePhotoStatus == true && (
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
                      download={`delivery-shipping-receipt${selectedClaim?.id}.jpg`}
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
                  download={`delivery-shipping-receipt${selectedClaim?.id}.jpg`}
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
    </div>
  );
};

export default ShipmentDetailsSection;
