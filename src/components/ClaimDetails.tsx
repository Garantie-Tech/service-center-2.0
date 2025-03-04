"use client";

import { useGlobalStore } from "@/store/store";
import ClaimDetailsTab from "@/components/claim/ClaimDetailsTab";
import EstimateDetailsTab from "@/components/claim/EstimateDetailsTab";
import ApprovalDetailsTab from "@/components/claim/ApprovalDetailsTab";
import FinalDocumentsTab from "@/components/claim/FinalDocumentsTab";
import { Tab } from "@/interfaces/GlobalInterface";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import Claim from "@/interfaces/ClaimInterface";
import { submitEstimate } from "@/services/claimService";
import ClaimActionsDropdown from "./ClaimActionsDropdown";
import { useNotification } from "@/context/NotificationProvider";
import CustomerDocumentsTab from "@/components/claim/CustomerDocumentsTab";
import CancelledClaim from "@/components/claim/CancelledClaimTab";
import RejectedClaim from "@/components/claim/RejectedClaim";
import {
  getFilteredTabs,
  getStatusIcon,
  getTabStatus,
} from "@/helpers/globalHelper";

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

  const filteredTabs: Tab[] = getFilteredTabs(claimStatus);

  const cancelledData = {
    cancelledBy: selectedClaim?.cancelled_by,
    cancelledReason: selectedClaim?.cancellation_reason,
  };

  const rejectedData = {
    rejectedReason: selectedClaim?.rejection_reason,
  };

  const customerDocuments = {
    aadharFront: "/uploads/aadhar-front.jpg",
    aadharBack: "/uploads/aadhar-back.jpg",
    bankDetails: "/uploads/bank-passbook.pdf",
    panCard: "/uploads/pan-card.jpg",
  };

  return (
    <div className="w-full">
      <div className="py-3 px-8 flex items-center justify-between border-b">
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
              <span className="text-sm text-darkGray">
                / {selectedClaim.name}
              </span>
            </div>
            <p className="text-darkGray text-xxs">
              {formatDate(selectedClaim.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button title="Edit">
            <Image
              src="/images/edit-icon.svg"
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
      <div className="px-8 mt-6">
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
      </div>
    </div>
  );
};

export default ClaimDetails;
