import Image from "next/image";
import React, { useState } from "react";

interface SearchSectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearch: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
}) => {
  const handleClearSearch = () => {
    setSearchTerm(""); // Clear the search term
  };

  return (
    <div className="bg-white p-3 mt-3 rounded-md shadow-sm w-[98%] mx-auto">
      <div className="flex justify-between items-center">
        {/* Claims Summary */}
        <div>
          <h2 className="text-sm font-bold">Claims</h2>
          <p className="text-xxs text-gray-500">50/1000</p>
        </div>

        {/* Search Input */}
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="relative w-auto md:w-1/3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Claim number, customer mobile, or IMEI number"
              className="input input-bordered w-full text-sm pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-10 flex items-center text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button className="btn btn-circle bg-primaryBlue text-white flex items-center justify-center transition duration-200 hover:bg-blue-500">
            <Image
              src="/images/download-icon.svg"
              alt="Download"
              width={20}
              height={20}
            />
          </button>
          <button className="btn bg-primaryBlue text-white flex items-center gap-2 transition duration-200 hover:bg-blue-500">
            <Image
              src="/images/plus-circle.svg"
              alt="Initiate Claim"
              width={20}
              height={20}
            />
            Initiate Claim
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
