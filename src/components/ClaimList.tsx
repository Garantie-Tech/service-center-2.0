import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import { getActiveTab } from "@/helpers/globalHelper";

const ClaimList: React.FC = () => {
  const {
    filteredClaims,
    selectedClaim,
    setSelectedClaim,
    setClaimStatus,
    setEstimateDetailsState,
    setApprovalDetails,
    setActiveTab,
  } = useGlobalStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Claim Initiated":
        return "bg-primaryBlue";
      case "Invalid Documents":
        return "bg-primaryBlue";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <ul className="space-y-2">
        {filteredClaims.map((claim) => (
          <li
            key={claim.id}
            className={`flex items-center justify-between shadow-sm p-4 ${
              selectedClaim?.id === claim.id
                ? "bg-claimListBackground"
                : "hover:bg-gray-50"
            } cursor-pointer ${
              claim.status === "Invalid Documents" ||
              claim.status === "Claim Initiated"
                ? "border-l-4 border-primaryBlue bg-claimListBackground"
                : ""
            }`}
            onClick={() => {
              setSelectedClaim(claim);
              setClaimStatus(claim.status);
              setActiveTab(
                getActiveTab(claim.status) as
                  | "Claim Details"
                  | "Estimate"
                  | "Approval"
                  | "Final Documents"
              );
              setEstimateDetailsState({
                estimateAmount: claim?.claimed_amount || "",
                jobSheetNumber: claim?.job_sheet_number || "",
                estimateDetails: claim?.data?.inputs?.estimate_details || "",
                replacementConfirmed: claim?.imei_changed ? "yes" : "no",
                damagePhotos: claim?.mobile_damage_photos || [],
                estimateDocument: claim?.documents?.["15"]?.url || null,
              });
              setApprovalDetails({
                estimateAmount: Number(claim?.claimed_amount),
                approvedAmount: Number(claim?.approved_amount),
                approvalType: claim?.status,
                approvalDate: claim?.approval_date,
              });
            }}
          >
            <div>
              <div className="flex">
                <p className="text-base font-semibold text-gray-800 mr-2">
                  {claim.id}
                </p>
                {(claim.status === "Invalid Documents" ||
                  claim.status === "Claim Initiated") && (
                  <Image
                    src="/images/action-required-icon.svg"
                    alt="Action required"
                    width={14}
                    height={14}
                  />
                )}
              </div>
              <p className="text-xs text-gray-600">{claim.name}</p>
            </div>
            <div className="text-xs text-right">
              <span
                className={`badge font-semibold ${getStatusBadge(
                  claim.status
                )} mb-1 text-xs px-4 py-[10px] ${
                  claim.status === "Invalid Documents" ||
                  claim.status === "Claim Initiated"
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                {claim.status}
              </span>
              <p className="text-xs text-gray-500">
                {formatDate(claim?.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClaimList;
