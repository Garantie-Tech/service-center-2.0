interface Claim {
  id: number;
  customer_name: string;
  status: string;
  date: string;
}

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
  return (
    <ul>
      {claims.map((claim) => (
        <li
          key={claim.id}
          className={`flex justify-between p-2 border-b hover:bg-gray-100 cursor-pointer ${
            selectedClaim?.id === claim.id ? "bg-lightBlue" : ""
          } rounded-md`}
          onClick={() => setSelectedClaim(claim)}
        >
          <div>
            <p className="font-semibold">{claim.id}</p>
            <p className="text-sm text-gray-600">{claim.customer_name}</p>
          </div>
          <div>
            <p
              className={`badge ${
                claim.status.includes("Initiated")
                  ? "badge-primary"
                  : claim.status.includes("Approved")
                  ? "badge-success"
                  : "badge-secondary"
              }`}
            >
              {claim.status}
            </p>
            <p className="text-sm text-gray-500">{claim.date}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ClaimList;
