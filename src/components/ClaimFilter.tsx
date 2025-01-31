import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Claim from "@/interfaces/ClaimInterface";

interface ClaimFilterProps {
  handleFilterChange: (value: string) => void;
  applyFilters: (filters: {
    fromDate: string;
    toDate: string;
    claimTypes: {
      myClaims: boolean;
      otherClaims: boolean;
      pendingClaims: boolean;
    };
  }) => void;
  handleSortingChange: (
    sortBy: keyof Claim,
    order: "Ascending" | "Descending"
  ) => void; // Sorting function
  claimStatuses: Record<string, string>;
}

const ClaimFilter: React.FC<ClaimFilterProps> = ({
  handleFilterChange,
  applyFilters,
  handleSortingChange,
  claimStatuses,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [claimTypes, setClaimTypes] = useState({
    myClaims: false,
    otherClaims: false,
    pendingClaims: false,
  });
  const [selectedDropdown, setSelectedDropdown] = useState("All Claims");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortingOpen, setIsSortingOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("SRN");
  const [sortOrder, setSortOrder] = useState<string>("Ascending");

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
    applyFilters(filters);
    setIsFilterOpen(false);
  };

  const handleDropdownChange = (value: string) => {
    setSelectedDropdown(value);
    handleFilterChange(value);
    setIsDropdownOpen(false);
  };

  const handleSortChange = (sortKey: string) => {
    setSortBy(sortKey);
    handleSortingChange(
      sortBy as keyof Claim,
      sortOrder as "Ascending" | "Descending"
    ); // Apply sorting immediately
    setIsSortingOpen(false);
  };

  const toggleSortOrder = (order: string) => {
    setSortOrder(order);
    handleSortingChange(
      sortBy as keyof Claim,
      order as "Ascending" | "Descending"
    ); // Apply sorting immediately
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
          <summary className="custom-button btn-default w-full flex items-center justify-between">
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
            {Object.entries(claimStatuses).map(([key, value]) => (
              <li key={key}>
                <button
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-200"
                  onClick={() => handleDropdownChange(key)}
                >
                  <Image
                    src={`/images/${key
                      .toLowerCase()
                      .replace(/\s+/g, "-")}-icon.svg`}
                    alt={key}
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  {value}{" "}
                  {/* ✅ Show the human-readable status instead of the key */}
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
          <div className="relative">
            <button
              className="px-2"
              title="Sorting"
              onClick={() => setIsSortingOpen(!isSortingOpen)}
            >
              <Image
                src="/images/sorting-icon.svg"
                alt="Sort"
                width={35}
                height={35}
              />
            </button>
            {isSortingOpen && (
              <div className="absolute top-10 right-0 bg-white p-4 rounded-lg shadow-lg z-50 w-72 text-xs">
                <h3 className="text-sm font-bold mb-3">Sort BY:</h3>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="radio rounded-[20px] mr-2 checked:bg-primaryBlue"
                      name="sortOrder"
                      checked={sortOrder === "Ascending"}
                      onChange={() => toggleSortOrder("Ascending")}
                    />
                    Ascending
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="radio rounded-[20px] mr-2 checked:bg-primaryBlue"
                      name="sortOrder"
                      checked={sortOrder === "Descending"}
                      onChange={() => toggleSortOrder("Descending")}
                    />
                    Descending
                  </label>
                </div>
                <ul className="text-sm">
                  {["SRN", "Follow UP", "Time"].map((sortKey) => (
                    <li
                      key={sortKey}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                      onClick={() => handleSortChange(sortKey)}
                    >
                      {sortKey}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Modal */}
      {isFilterOpen && (
        <div
          ref={filterRef}
          className="absolute top-0 right-0 transform translate-x-full bg-white p-4 rounded-lg shadow-lg z-50 w-96 text-sm"
          style={{
            top: "70px",
            left: "-80px",
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
                  className="checkbox rounded-[4px] checked:bg-primaryBlue"
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
                  className="checkbox rounded-[4px] checked:bg-primaryBlue"
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
                  className="checkbox rounded-[4px] checked:bg-primaryBlue"
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
