"use client";

import { useGlobalStore } from "@/store/store";
import ClaimDetailsTab from "@/components/claim/ClaimDetailsTab";
import EstimateDetailsTab from "@/components/claim/EstimateDetailsTab";
import ApprovalDetailsTab from "@/components/claim/ApprovalDetailsTab";
import FinalDocumentsTab from "@/components/claim/FinalDocumentsTab";
import { Tab } from "@/interfaces/GlobalInterface";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import Claim, {
  CustomerDocuments,
  SettlementDetailsProps,
} from "@/interfaces/ClaimInterface";
import { addRemark, submitEstimate } from "@/services/claimService";
import ClaimActionsDropdown from "@/components/ClaimActionsDropdown";
import { useNotification } from "@/context/NotificationProvider";
import CustomerDocumentsTab from "@/components/claim/CustomerDocumentsTab";
import CancelledClaim from "@/components/claim/CancelledClaimTab";
import RejectedClaim from "@/components/claim/RejectedClaim";
import {
  getFilteredTabs,
  getStatusIcon,
  getTabStatus,
} from "@/helpers/globalHelper";
import SettlementDetailsTab from "@/components/claim/SettlementDetailsTab";
import RemarksComponent from "@/components/RemarksComponent";
import { useState } from "react";

const ClaimDetails: React.FC<{ selectedClaim: Claim | null }> = ({
  selectedClaim,
}) => {
  const {
    activeTab,
    setActiveTab,
    setIsLoading,
    claimStatus,
    triggerClaimRefresh,
  } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const [isRemarksOpen, setIsRemarksOpen] = useState(false);

  const handleRemarksSubmit = async (remark: string) => {
    try {
      const response = await addRemark(
        Number(selectedClaim?.id),
        "Service Centre",
        remark
      );

      if (!response) {
        notifyError("Failed to add remark. Please try again.");
      } else {
        triggerClaimRefresh();
        notifySuccess("Remark Added successfully!");
      }
    } catch (error) {
      console.error("Error Adding remark:", error);
      notifyError("An error occurred while adding the remark.");
    }
  };

  if (!selectedClaim) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <h2 className="text-lg font-semibold">No Claim Selected</h2>
        <p className="text-gray-500">Please select a claim to view details.</p>
      </div>
    );
  }

  const claimData = {
    claimDate: formatDate(selectedClaim?.created_at),
    planType: selectedClaim?.product,
    imei: selectedClaim?.imei_number,
    coPay: {
      amount: Number(selectedClaim?.copayment_amount) || 0,
    },
    claimDetails: selectedClaim?.data?.inputs?.damage_details || "",
    service_centre_name: selectedClaim?.service_centre_name || "",
    damageDate:
      formatDate(String(selectedClaim?.data?.inputs?.damage_date)) || "",
    pickup_details: {
      is_tvs_claim: selectedClaim?.is_tvs_claim ?? false,
      customer_pickup_details: selectedClaim?.customer_pickup_details,
      pickup_photos: selectedClaim?.pickup_photos,
      pickup_video: selectedClaim?.pickup_video,
    },
    shipping_info:selectedClaim?.shipping_info,
    available_for_pickup: selectedClaim?.available_for_pickup
  };

  const handleEstimateSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const response = await submitEstimate(selectedClaim?.id, formData);

      if (!response.success) {
        notifyError("Failed to submit estimate!");
      } else {
        notifySuccess("Estimate Submitted Successfully!");
        triggerClaimRefresh();
      }
    } catch (error) {
      notifyError(`Failed to submit estimate! ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTabs: Tab[] = getFilteredTabs(claimStatus, selectedClaim);

  const cancelledData = {
    cancelledBy: selectedClaim?.cancelled_by,
    cancelledReason: selectedClaim?.cancellation_reason,
    copayRefunded: selectedClaim?.copay_refunded,
    copayRefundedDate: selectedClaim?.copay_refunded_date,
    copayRefundedId: selectedClaim?.copay_refunded_id,
    copayRefundedAmount: selectedClaim?.copay_refunded_amount,
  };

  const rejectedData = {
    rejectedReason: selectedClaim?.rejection_reason,
    copayRefunded: selectedClaim?.copay_refunded,
    copayRefundedDate: selectedClaim?.copay_refunded_date,
    copayRefundedId: selectedClaim?.copay_refunded_id,
    copayRefundedAmount: selectedClaim?.copay_refunded_amount,
  };

  const customerDocuments: CustomerDocuments = {
    aadharDocuments: {
      "76": selectedClaim?.documents?.["76"],
      documents: selectedClaim?.aadhar_photos,
    },
    bankDetails: selectedClaim?.documents?.["77"],
    panCard: selectedClaim?.documents?.["78"],
    accessoriesProvided: selectedClaim?.data?.accessory_provided
      ? String(selectedClaim?.data?.accessory_provided)
      : "",
  };

  const settlementDetailsData: SettlementDetailsProps = {
    utr_number: selectedClaim?.utr_number ? selectedClaim?.utr_number : "N/A",
    payment_date: selectedClaim?.payment_date
      ? selectedClaim?.payment_date
      : "N/A",
    payment_amount: selectedClaim?.payment_amount
      ? selectedClaim?.payment_amount
      : "N/A",
  };

  return (
    <div className="w-full">
      <div className="py-3 px-8 flex items-center justify-between border-b bg-claimListBackground">
        <div className="flex items-start gap-3">
          <Image
            src="/images/chevron-down.svg"
            alt="chevron"
            width={20}
            height={20}
            className="cursor-pointer"
          />
          <div className="leading-[20px]">
            <div>
              <span className="text-xl font-bold">{selectedClaim.id} </span>
              <span className="text-base text-darkGray">
                / {selectedClaim.name}
              </span>
            </div>
            <p className="text-darkGray text-xs">
              {formatDate(selectedClaim.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="tooltip tooltip-bottom"
            data-tip="Remarks"
            onClick={() => setIsRemarksOpen(true)}
          >
            <Image
              src="/images/remarks-icon.svg"
              alt="Edit"
              width={24}
              height={24}
              className="cursor-pointer"
            />
          </button>
          <ClaimActionsDropdown />
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="px-8 flex border-b gap-14 items-center overflow-auto md:overflow-visible">
        {filteredTabs.map((tab) => {
          const tabStatus = getTabStatus(tab, selectedClaim);
          const iconSrc = getStatusIcon(tabStatus);

          return (
            <button
              key={tab}
              className={`flex items-center py-6 justify-center text-base font-bold ${
                activeTab === tab
                  ? "border-b-2 border-primaryBlue text-black"
                  : "text-black"
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {activeTab === tab && iconSrc && (
                <Image
                  src={iconSrc}
                  alt="Status Icon"
                  width={20}
                  height={20}
                  className="mr-2"
                />
              )}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="px-8 mt-6 overflow-scroll h-[80vh]">
        {activeTab === "Claim Details" && <ClaimDetailsTab data={claimData} />}
        {activeTab === "Estimate" && (
          <EstimateDetailsTab onSubmit={handleEstimateSubmit} />
        )}
        {activeTab === "Approval" && <ApprovalDetailsTab />}
        {activeTab === "Final Documents" && <FinalDocumentsTab />}
        {activeTab === "Customer Documents" && (
          <CustomerDocumentsTab documents={customerDocuments} />
        )}
        {activeTab === "Cancelled" && <CancelledClaim data={cancelledData} />}
        {activeTab === "Rejected" && <RejectedClaim data={rejectedData} />}
        {activeTab === "Settlement Details" && (
          <SettlementDetailsTab data={settlementDetailsData} />
        )}
      </div>

      {/* remarks popup */}

      <RemarksComponent
        isOpen={isRemarksOpen}
        onClose={() => setIsRemarksOpen(false)}
        onSubmit={handleRemarksSubmit}
      />
    </div>
  );
};

export default ClaimDetails;
