"use client";

import { useGlobalStore } from "@/store/store";
import ClaimDetailsTab from "@/components/claim/ClaimDetailsTab";
import EstimateDetailsTab from "@/components/claim/EstimateDetailsTab";
import ApprovalDetailsTab from "@/components/claim/ApprovalDetailsTab";
import FinalDocumentsTab from "@/components/claim/FinalDocumentsTab";
import { CLAIM_TABS, Tab, TabStatus } from "@/interfaces/GlobalInterface";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import Claim from "@/interfaces/ClaimInterface";

const getTabStatus = (tab: Tab, selectedClaim: Claim): TabStatus => {
  if (!selectedClaim) return "empty";

  switch (tab) {
    case "Claim Details":
      return selectedClaim ? "success" : "error";
    case "Estimate":
      return selectedClaim
        ? "success"
        : selectedClaim
        ? "error"
        : "empty";
    case "Approval":
      return selectedClaim
        ? "success"
        : selectedClaim
        ? "error"
        : "empty";
    case "Final Documents":
      return selectedClaim
        ? "success"
        : selectedClaim
        ? "error"
        : "empty";
    default:
      return "empty";
  }
};

const getStatusIcon = (status: TabStatus): string | null => {
  switch (status) {
    case "success":
      return "/images/check-icon.svg";
    case "error":
      return "/images/action-required-icon.svg";
    case "empty":
    default:
      return null;
  }
};

const ClaimDetails: React.FC = () => {
  const { selectedClaim, activeTab, setActiveTab } = useGlobalStore();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  if (!selectedClaim) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold">Select an item to read</h2>
        <p className="text-gray-500">Nothing is selected</p>
      </div>
    );
  }

  const claimData = {
    claimDate: formatDate(selectedClaim?.created_at),
    planType: selectedClaim?.product,
    imei: selectedClaim?.imei_number,
    coPay: {
      amount: Number(selectedClaim?.copayment_amount) || 0 ,
    },
    claimDetails:selectedClaim?.data?.inputs?.damage_details,
  };

  return (
    <div className="">
      {/* Top Section */}
      <div className="py-3 px-8 flex items-center justify-between pb-3 border-b">
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
          <button title="More Options">
            <Image
              src="/images/three-dots.svg"
              alt="More Options"
              width={24}
              height={5}
              className="cursor-pointer"
              style={{ height: "20px" }}
            />
          </button>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="px-8 flex border-b gap-8 items-center">
        {CLAIM_TABS.map((tab) => {
          const tabStatus = getTabStatus(tab, selectedClaim);
          const iconSrc = getStatusIcon(tabStatus);

          return (
            <button
              key={tab}
              className={`flex items-center py-6 justify-center text-base font-bold ${
                activeTab === tab
                  ? "border-b-2 border-primaryBlue text-black"
                  : "text-gray-400"
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
        {activeTab === "Estimate" && <EstimateDetailsTab />}
        {activeTab === "Approval" && <ApprovalDetailsTab />}
        {activeTab === "Final Documents" && <FinalDocumentsTab />}
      </div>
    </div>
  );
};

export default ClaimDetails;
