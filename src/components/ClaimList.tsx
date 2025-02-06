import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";

const ClaimList: React.FC = () => {
  const { filteredClaims, selectedClaim, setSelectedClaim } = useGlobalStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Estimate Revised":
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
                  <Image src="/images/action-required-icon.svg" alt="Action required" width={14} height={14} />
                )}
              </div>
              <p className="text-xs text-gray-600">{claim.name}</p>
            </div>
            <div className="text-xs text-right">
              <span className={`badge font-semibold ${getStatusBadge(claim.status)} mb-1 text-xs px-4 py-[10px] ${claim.status !== "Estimate Revised" ? "text-gray-800" : "text-white"}`}>
                {claim.status}
              </span>
              <p className="text-xs text-gray-500">{formatDate(claim?.created_at)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClaimList;
