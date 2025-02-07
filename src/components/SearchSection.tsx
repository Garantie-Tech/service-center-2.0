"use client";

import Image from "next/image";
import { useGlobalStore } from "@/store/store";
import { fetchExportData } from "@/services/exportService";
import { exportToCSV } from "@/utils/exportCsv";
import { useNotification } from "@/context/NotificationProvider";
import { redirectToClaimsPortal } from "@/utils/redirect";

const SearchSection: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    handleSearch,
    setIsLoading,
    filterStatus,
  } = useGlobalStore();

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const { notifySuccess, notifyError } = useNotification();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const requestParams = {
        page: 1,
        pageSize: 25,
        search: searchTerm,
        status: filterStatus,
      };
      const response = await fetchExportData(requestParams);

      if (response?.success) {
        if (!response?.data?.data || response.data.data.length === 0) {
          notifyError("No data to export.");
          return;
        }
        exportToCSV(response.data.data, "claims_export.csv");
        notifySuccess("Data exported successfully !");
      } else {
        notifyError("Failed to export data.");
      }
    } catch (e) {
      notifyError(`Failed to export data. Something went wrong ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 mt-3 rounded-md shadow-sm w-[98%] mx-auto">
      <div className="flex justify-between items-between w-full gap-8">
        {/* Claims Summary */}
        <div className="flex w-1/4 items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Claims</h2>
            <p className="text-xxs text-gray-500">50/1000</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="tooltip"
            data-tip="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex align-center justify-between gap-2 w-3/4">
          <div className="relative w-auto md:w-1/2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Claim number, customer mobile, or IMEI number"
              className="input input-bordered w-full text-xs pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-10 flex items-center text-gray-500 hover:text-gray-800 tooltip"
                data-tip="Clear Search"
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
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-800 tooltip"
              data-tip="Search"
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

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex gap-4">
              <button
                className="w-[30px] ml-20px tooltip"
                data-tip="Plan Finder"
              >
                <Image
                  src="/images/plan-finder.svg"
                  alt="Download"
                  width={24}
                  height={24}
                />
              </button>
              <button
                onClick={handleExport}
                className="w-[30px] tooltip"
                data-tip="Export Claims"
              >
                <Image
                  src="/images/download-icon.svg"
                  alt="Download"
                  width={24}
                  height={24}
                />
              </button>
            </div>
            <button
              onClick={redirectToClaimsPortal}
              className="btn bg-primaryBlue text-white flex items-center gap-2 transition duration-200 hover:bg-blue-500 tooltip"
              data-tip="Initiate Claim"
            >
              <Image
                src="/images/plus-circle.svg"
                alt="Initiate Claim"
                width={20}
                height={20}
              />
              <span className="hidden md:block">Initiate Claim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
