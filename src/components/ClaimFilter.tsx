import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ClaimFilterProps {
  filterStatus: string;
  handleFilterChange: (value: string) => void;
  applyFilters: (filters: {
    fromDate: string;
    toDate: string;
    claimTypes: {
      myClaims: boolean;
      otherClaims: boolean;
      pendingClaims: boolean;
    };
  }) => void; // Function to handle filter application
}

const ClaimFilter: React.FC<ClaimFilterProps> = ({
  filterStatus,
  handleFilterChange,
  applyFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState<string>(""); // State for From Date
  const [toDate, setToDate] = useState<string>(""); // State for To Date
  const [claimTypes, setClaimTypes] = useState({
    myClaims: false,
    otherClaims: false,
    pendingClaims: false,
  }); // State for Claim Types

  const filterRef = useRef<HTMLDivElement>(null);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const closeFilter = (e: MouseEvent) => {
    if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
      setIsFilterOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeFilter);
    return () => {
      document.removeEventListener("mousedown", closeFilter);
    };
  }, []);

  const handleApply = () => {
    const filters = {
      fromDate,
      toDate,
      claimTypes,
    };
    applyFilters(filters); // Pass filters to the parent component
    setIsFilterOpen(false); // Close the filter modal
  };

  const handleCheckboxChange = (type: keyof typeof claimTypes) => {
    setClaimTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div>
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

        {/* Filter Button */}
        <button
          className="btn btn-circle text-gray-500 hover:text-gray-700 ml-2"
          title="Filter"
          onClick={toggleFilter}
        >
          <Image
            src="/images/filter-icon.svg"
            alt="Filter"
            width={20}
            height={20}
          />
        </button>

        {/* Sort Button */}
        <button
          className="btn btn-circle text-gray-500 hover:text-gray-700 ml-2"
          title="Sort"
        >
          <Image
            src="/images/sorting-icon.svg"
            alt="Sort"
            width={20}
            height={20}
          />
        </button>
      </div>

      {/* Dropdown Modal */}
      {isFilterOpen && (
        <div
          ref={filterRef}
          className="absolute top-0 right-0 transform translate-x-full bg-white p-4 rounded-lg shadow-lg z-50 w-96"
          style={{
            top: "70px",
            left: "-40px", // Retaining your previous styles for positioning
          }}
        >
          <h3 className="text-lg font-bold mb-3">Date Range</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-xs input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-xs input input-bordered w-full"
              />
            </div>
          </div>

          {/* Date Range Buttons */}
          <div className="flex gap-2 justify-between mb-4">
            <button
              className="btn btn-outline w-1/3 text-xs py-1"
              onClick={() => {
                setFromDate(new Date().toISOString().split("T")[0]);
                setToDate(new Date().toISOString().split("T")[0]);
              }}
            >
              Today
            </button>
            <button
              className="btn btn-outline w-1/3 text-xs py-1"
              onClick={() => {
                const today = new Date();
                const firstDayOfWeek = new Date(
                  today.setDate(today.getDate() - today.getDay())
                );
                setFromDate(firstDayOfWeek.toISOString().split("T")[0]);
                setToDate(new Date().toISOString().split("T")[0]);
              }}
            >
              This Week
            </button>
            <button
              className="btn btn-outline w-1/3 text-xs py-1"
              onClick={() => {
                const today = new Date();
                const firstDayOfMonth = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  1
                );
                setFromDate(firstDayOfMonth.toISOString().split("T")[0]);
                setToDate(new Date().toISOString().split("T")[0]);
              }}
            >
              This Month
            </button>
          </div>

          {/* Claim Types */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-bold mb-3">Claim Types</h3>
            <div className="text-xs flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={claimTypes.myClaims}
                  onChange={() => handleCheckboxChange("myClaims")}
                />
                <span className="ml-2 text-xs">My Claims</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={claimTypes.otherClaims}
                  onChange={() => handleCheckboxChange("otherClaims")}
                />
                <span className="ml-2 text-xs">Other Claims</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={claimTypes.pendingClaims}
                  onChange={() => handleCheckboxChange("pendingClaims")}
                />
                <span className="ml-2 text-xs">Pending Claims</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="btn w-1/2 btn-outline text-base px-4 py-1"
              onClick={() => setIsFilterOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn w-1/2 bg-primaryBlue text-white text-base px-4 py-1"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimFilter;
