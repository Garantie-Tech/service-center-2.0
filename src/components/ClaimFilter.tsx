import Image from "next/image";

interface ClaimFilterProps {
  filterStatus: string;
  handleFilterChange: (value: string) => void;
}

const ClaimFilter: React.FC<ClaimFilterProps> = ({
  filterStatus,
  handleFilterChange,
}) => {
  return (
    <div className="flex justify-between items-center mb-3">
      {/* Dropdown for filtering claims */}
      <select
        value={filterStatus}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="select select-bordered w-full text-sm"
      >
        <option value="All Claims">All Claims</option>
        <option value="Claim Initiated">Claim Initiated</option>
        <option value="BER Approved">BER Approved</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      {/* Sort Button */}
      <button
        className="btn btn-circle text-gray-500 hover:text-gray-700 ml-2"
        title="Filter"
      >
        <Image
          src="/images/filter-icon.svg"
          alt="Download"
          width={20}
          height={20}
        />
      </button>
      <button
        className="btn btn-circle text-gray-500 hover:text-gray-700 ml-2"
        title="Sort"
      >
        <Image
          src="/images/sorting-icon.svg"
          alt="Download"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
};

export default ClaimFilter;
