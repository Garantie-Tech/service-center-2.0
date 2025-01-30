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
  const [selectedDropdown, setSelectedDropdown] = useState("All Claims"); // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown visibility state

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

  const handleDropdownChange = (value: string) => {
    setSelectedDropdown(value);
    handleFilterChange(value); // Call the parent function (in this case, Dashboard's handler)
    setIsDropdownOpen(false); // Close the dropdown
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        {/* Custom Dropdown */}
        <details
          className={`dropdown w-full ${isDropdownOpen ? "open" : ""}`}
          open={isDropdownOpen}
          onToggle={(e) =>
            setIsDropdownOpen((e.target as HTMLDetailsElement).open)
          }
        >
          <summary className="btn btn-outline w-full flex items-center justify-between">
            <span className="flex items-center text-xs">
              {selectedDropdown}
            </span>
            <Image
              src="/images/select-dropdown.svg"
              alt="Arrow"
              width={20}
              height={20}
              className="ml-2"
            />
          </summary>
          <ul className="dropdown-content menu bg-base-100 w-full rounded-box mt-2 shadow-lg text-xs">
            {[
              "All Claims",
              "Estimate Pending",
              "Approval Pending",
              "Cancelled",
              "Payment Pending",
              "Rejected",
              "Completed",
              "Approved",
            ].map((option) => (
              <li key={option}>
                <button
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-200"
                  onClick={() => handleDropdownChange(option)}
                >
                  <Image
                    src={`/images/${option
                      .toLowerCase()
                      .replace(/\s+/g, "-")}-icon.svg`}
                    alt={option}
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </details>

        {/* Filter Button */}
        <div className="flex justify-between items-center px-4">
          <button className="px-2" title="Filter" onClick={toggleFilter}>
            <Image
              src="/images/filter-icon.svg"
              alt="Filter"
              width={40}
              height={40}
            />
          </button>

          {/* Sort Button */}
          <button className="px-2" title="Sorting">
            <Image
              src="/images/sorting-icon.svg"
              alt="Sort"
              width={35}
              height={35}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Modal */}
      {isFilterOpen && (
        <div
          ref={filterRef}
          className="absolute top-0 right-0 transform translate-x-full bg-white p-4 rounded-lg shadow-lg z-50 w-96 text-sm"
          style={{
            top: "70px",
            left: "-80px", // Retaining your previous styles for positioning
          }}
        >
          <h3 className="text-sm font-bold mb-3">Date Range</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-xs input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">To</label>
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
              className="custom-button btn-default w-[32%] text-xs py-1"
              onClick={() => {
                setFromDate(new Date().toISOString().split("T")[0]);
                setToDate(new Date().toISOString().split("T")[0]);
              }}
            >
              Today
            </button>
            <button
              className="custom-button btn-default w-[32%] text-xs py-1"
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
              className="custom-button btn-default w-[32%] text-xs py-1"
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
          <div className="border-t pt-[30px] mt-[20px] mb-[40px]">
            <div className="text-xs flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox rounded-[4px]"
                  checked={claimTypes.myClaims}
                  onChange={() =>
                    setClaimTypes((prev) => ({
                      ...prev,
                      myClaims: !prev.myClaims,
                    }))
                  }
                />
                <span className="ml-2 text-xs">My Claims</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox rounded-[4px]"
                  checked={claimTypes.otherClaims}
                  onChange={() =>
                    setClaimTypes((prev) => ({
                      ...prev,
                      otherClaims: !prev.otherClaims,
                    }))
                  }
                />
                <span className="ml-2 text-xs">Other Claims</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox rounded-[4px]"
                  checked={claimTypes.pendingClaims}
                  onChange={() =>
                    setClaimTypes((prev) => ({
                      ...prev,
                      pendingClaims: !prev.pendingClaims,
                    }))
                  }
                />
                <span className="ml-2 text-xs">Pending Claims</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="custom-button btn-default w-1/2 text-base"
              onClick={() => setIsFilterOpen(false)}
            >
              Cancel
            </button>
            <button
              className="custom-button btn-primary w-1/2 bg-primaryBlue text-white text-base"
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
