"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { useGlobalStore } from "@/store/store";
import { SortByOptions, SortOrder } from "@/interfaces/ClaimFilterInterfaces";
import { SORT_OPTIONS } from "@/globalConstant";

const ClaimFilter: React.FC = () => {
  const {
    isFilterOpen,
    toggleFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    claimTypes,
    selectedDropdown,
    setSelectedDropdown,
    isSortingOpen,
    setIsSortingOpen,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    setAppliedFilters,
    handleSortingChange,
    handleFilterChange,
    claimStatuses,
    setClaimTypes,
  } = useGlobalStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const filterRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(
    (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        if (isFilterOpen) toggleFilter();
      }
    },
    [isFilterOpen, toggleFilter]
  );

  useEffect(() => {
    document.addEventListener("mousedown", closeFilter);
    return () => {
      document.removeEventListener("mousedown", closeFilter);
    };
  }, [closeFilter]);

  const handleApply = () => {
    setAppliedFilters({ fromDate, toDate, claimTypes });
    toggleFilter();
  };

  const handleDropdownChange = (value: string) => {
    setSelectedDropdown(value);
    handleFilterChange(value);
    setIsDropdownOpen(false);
  };

  const handleSortChange = (sortKey: SortByOptions) => {
    setSortBy(sortKey);
    handleSortingChange(sortKey, sortOrder as "Asc" | "Desc");
    setIsSortingOpen(false);
  };

  const toggleSortOrder = (order: SortOrder) => {
    setSortOrder(order);
    handleSortingChange(sortBy, order as "Asc" | "Desc");
    setIsSortingOpen(false);
  };

  const sortingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortingRef.current &&
        !sortingRef.current.contains(event.target as Node)
      ) {
        setIsSortingOpen(false);
      }
    }

    if (isSortingOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortingOpen]);

  const handleClaimTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedType = event.target.value;

    // Reset all claim types and set the selected one to true
    setClaimTypes({
      myClaims: selectedType === "mySC",
      otherClaims: selectedType === "otherSC",
      pendingClaims: selectedType === "pendingClaims",
    });
  };

  const handleCancel = () => {
    const isAnyClaimTypeSelected =
    claimTypes.myClaims || claimTypes.otherClaims || claimTypes.pendingClaims;

    if (fromDate || toDate || isAnyClaimTypeSelected) {
      setToDate("");
      setFromDate("");
      setClaimTypes({
        myClaims: false,
        otherClaims: false,
        pendingClaims: false,
      });
      setAppliedFilters({ fromDate: "", toDate: "", claimTypes });
    }
    toggleFilter();
  };

  const mappedClaimType: Record<
    "mySC" | "otherSC" | "pendingClaims",
    keyof typeof claimTypes
  > = {
    mySC: "myClaims",
    otherSC: "otherClaims",
    pendingClaims: "pendingClaims",
  };

  return (
    <div className="sticky top-0 bg-white h-[50px] mt-2">
      <div className="flex justify-between items-center mb-3">
        {/* Custom Dropdown */}
        <details
          ref={dropdownRef}
          className={`dropdown w-full ${isDropdownOpen ? "open" : ""}`}
          open={isDropdownOpen}
          onToggle={(e) =>
            setIsDropdownOpen((e.target as HTMLDetailsElement).open)
          }
        >
          <summary
            className="custom-button btn-default w-full flex items-center justify-between cursor-pointer tooltip tooltip-bottom"
            data-tip="Claim Status"
          >
            <span className="flex items-center text-sm">
              {claimStatuses[selectedDropdown] || "All Claims"}
            </span>
            <Image
              src="/images/select-dropdown.svg"
              alt="Arrow"
              width={20}
              height={20}
              className="ml-2"
            />
          </summary>
          <ul className="dropdown-content menu bg-base-100 w-full rounded-box mt-2 shadow-lg text-sm">
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
                  {value}
                </button>
              </li>
            ))}
          </ul>
        </details>

        {/* Filter Button */}
        <div className="flex justify-between items-center pl-4">
          <button
            className="px-2 tooltip tooltip-bottom"
            title="Filter"
            onClick={toggleFilter}
            data-tip="Filter"
          >
            <Image
              src="/images/filter-icon.svg"
              alt="Filter"
              width={40}
              height={40}
            />
          </button>

          {/* Sort Button */}
          <div className="relative" ref={sortingRef}>
            <button
              className="px-2 tooltip tooltip-bottom"
              data-tip="Sort"
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
              <div className="absolute top-[45px] right-0 bg-white p-4 rounded-lg shadow-lg z-50 w-100 text-xs">
                <h3 className="text-sm font-bold mb-3">Sort BY:</h3>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="radio rounded-[20px] mr-2 checked:bg-primaryBlue"
                      name="sortOrder"
                      checked={sortOrder === "Asc"}
                      onChange={() => toggleSortOrder("Asc")}
                    />
                    Ascending
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="radio rounded-[20px] mr-2 checked:bg-primaryBlue"
                      name="sortOrder"
                      checked={sortOrder === "Desc"}
                      onChange={() => toggleSortOrder("Desc")}
                    />
                    Descending
                  </label>
                </div>
                <ul className="text-sm">
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <li
                      key={key}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                      onClick={() => handleSortChange(key)}
                    >
                      {label}
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
          className="bg-white p-4 rounded-lg shadow-lg z-50 md:w-90 w-90 text-sm"
        >
          {/* Date Filters */}
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
            {["Today", "This Week", "This Month"].map((label, index) => (
              <button
                key={index}
                className="custom-button btn-default w-[32%] text-xs py-1"
                onClick={() => {
                  const today = new Date();
                  if (label === "This Week")
                    today.setDate(today.getDate() - today.getDay());
                  if (label === "This Month") today.setDate(1);
                  setFromDate(today.toISOString().split("T")[0]);
                  setToDate(new Date().toISOString().split("T")[0]);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Claim Types */}
          <h3 className="text-sm font-bold mb-3">Claim Type</h3>
          <div className="flex gap-2 mb-4">
            {(
              ["mySC", "otherSC", "pendingClaims"] as Array<
                keyof typeof claimTypes
              >
            ).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="claimType"
                  className="radio checked:bg-primaryBlue w-[20px] h-[20px]"
                  value={type}
                  checked={
                    claimTypes[
                      mappedClaimType[type as keyof typeof mappedClaimType]
                    ]
                  }
                  onChange={handleClaimTypeChange}
                />
                <span className="ml-2 text-xs capitalize">
                  {type.replace("SC", " SC").replace("Claims", " Claims")}
                </span>
              </label>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="btn w-1/2"
              onClick={() => {
                handleCancel();
              }}
            >
              Cancel
            </button>
            <button
              className="btn bg-primaryBlue hover:bg-lightPrimaryBlue text-white w-1/2"
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
