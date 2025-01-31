import { formatDate } from "@/helpers/dateHelper";
import Claim from "@/interfaces/ClaimInterface";
import Image from "next/image";

interface ClaimListProps {
  claims: Claim[];
  selectedClaim: Claim | null;
  setSelectedClaim: (claim: Claim) => void;
}

const ClaimList: React.FC<ClaimListProps> = ({
  claims,
  selectedClaim,
  setSelectedClaim,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Claim Initiated":
        return "bg-gray-200";
      case "Approved":
        return "bg-gray-200";
      case "Rejected":
        return "bg-gray-200";
      case "Cancelled":
        return "bg-gray-200";
      case "Estimate Revised":
        return "bg-primaryBlue";
      case "BER Approved":
        return "bg-gray-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <ul className="space-y-2">
        {claims.map((claim) => (
          <li
            key={claim.id}
            className={`flex items-center justify-between shadow-sm p-4 ${
              selectedClaim?.id === claim.id ? "bg-claimListBackground" : "hover:bg-gray-50"
            } cursor-pointer ${
              claim.status === "Estimate Revised"
                ? "border-l-4 border-primaryBlue bg-claimListBackground"
                : ""
            }`}
            onClick={() => setSelectedClaim(claim)}
          >
            <div>
              <div className="flex">
              <p className="text-base font-semibold text-gray-800 mr-2">{claim.id}</p>
              {claim.status === "Estimate Revised" && (
              <Image
              src="/images/action-required-icon.svg"
              alt="Action required"
              width={14}
              height={14}
            />
              ) }

              </div>
              <p className="text-xs text-gray-600">{claim.name}</p>
            </div>
            <div className="text-xs text-right">
              <span
                className={`badge font-semibold ${getStatusBadge(claim.status)} mb-1 text-xs px-4 py-[10px] ${claim.status != "Estimate Revised" ? "text-gray-800" : "text-white"}`}

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
