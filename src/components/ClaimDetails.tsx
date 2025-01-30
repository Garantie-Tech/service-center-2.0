interface Claim {
  id: number;
  customer_name: string;
  status: string;
  date: string;
}

interface ClaimDetailsProps {
  selectedClaim: Claim | null;
}

const ClaimDetails: React.FC<ClaimDetailsProps> = ({ selectedClaim }) => {
  if (!selectedClaim) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold">Select an item to read</h2>
        <p className="text-gray-500">Nothing is selected</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Claim Details</h2>
      <p>
        <strong>Claim ID:</strong> {selectedClaim.id}
      </p>
      <p>
        <strong>Customer Name:</strong> {selectedClaim.customer_name}
      </p>
      <p>
        <strong>Status:</strong> {selectedClaim.status}
      </p>
      <p>
        <strong>Date:</strong> {selectedClaim.date}
      </p>
    </div>
  );
};

export default ClaimDetails;
