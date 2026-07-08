"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { fetchClaims } from "@/services/claimService";
import { ClaimFetchPayload } from "@/interfaces/GlobalInterface";
import Claim from "@/interfaces/ClaimInterface";
import { DuplicateClaimsIcon } from "./icons/Icons";
import { applyClaimSelection } from "@/helpers/claimSelectionHelper";

const ClaimList: React.FC = () => {
  const {
    filteredClaims,
    setFilteredClaims,
    selectedClaim,
    setSelectedClaim,
    appliedFilters,
    filterStatus,
    setIsLoading,
    globalSearch,
    refreshClaimsTrigger,
    setClaimRevised,
    setClaimCount,
    claimTypes,
    sortOrder,
    filterState,
    filterServiceCentre,
    notificationTargetTab,
    setNotificationTargetTab,
  } = useGlobalStore();

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastClaimRef = useRef<HTMLLIElement | null>(null);
  const isFetching = useRef(false);

  const actionRequiredStatus = useMemo(
    () => ["Invalid Documents", "Claim Initiated", "BER Marked"],
    [],
  );

  // Generates API payload dynamically
  const generatePayload = useCallback(
    (pageNumber: number): ClaimFetchPayload => {
      const basePayload: ClaimFetchPayload = {
        page: pageNumber,
        partner_id: 191,
        source: "service_centre",
      };

      const user = localStorage.getItem("user");
      let serviceCenter: { user_type?: string } | null = null;

      try {
        serviceCenter = user ? JSON.parse(user) : null;
      } catch (e) {
        console.error("Invalid user data in localStorage", e);
      }

      if (globalSearch) {
        basePayload.claim_search = globalSearch;
      } else {
        basePayload.claim_status = filterStatus || "ALL CLAIMS";

        if (appliedFilters?.fromDate && appliedFilters?.toDate) {
          basePayload.duration = "custom";
          basePayload.startDate = appliedFilters.fromDate;
          basePayload.endDate = appliedFilters.toDate;
        }

        const activeClaimTypes = Object.entries(claimTypes)
          .filter(([, value]) => value)
          .map(([key]) => key);

        let selectedClaimType = "";

        if (serviceCenter?.user_type != "service_centre") {
          selectedClaimType = activeClaimTypes.includes("allClaims")
            ? "allClaims"
            : activeClaimTypes[0];
        } else {
          selectedClaimType = activeClaimTypes.includes("myClaims")
            ? "myClaims"
            : activeClaimTypes[0];
        }

        if (selectedClaimType) {
          basePayload.claim_type = selectedClaimType;
        }

        if (sortOrder) {
          basePayload.sort_by = sortOrder;
        }
        if (filterState.trim()) {
          basePayload.state_id = filterState;
        }

        if (filterServiceCentre.trim()) {
          basePayload.service_centre_id = filterServiceCentre;
        }
      }

      return basePayload;
    },
    [
      appliedFilters,
      filterStatus,
      globalSearch,
      claimTypes,
      sortOrder,
      filterState,
      filterServiceCentre,
    ],
  );

  // Fetch claims (main function)s
  const fetchClaimsData = useCallback(
    async (pageNumber: number, reset: boolean = false) => {
      if (loading || (!hasMore && !reset) || isFetching.current) return;

      isFetching.current = true; // Prevent duplicate calls
      setLoading(true);
      setIsLoading(true);

      try {
        const payload = generatePayload(pageNumber);
        const response = await fetchClaims(payload);

        if (response.success && Array.isArray(response.data?.data?.claims)) {
          const newClaims = response.data.data.claims;
          const claimCount = response.data.data.totalCount;
          setClaimCount(Number(claimCount));

          if (reset) {
            setFilteredClaims(newClaims);
            setPage(1); // Reset pagination
            setClaimStates(newClaims[0]);
          } else {
            setFilteredClaims((prevClaims) => [
              ...prevClaims,
              ...newClaims.filter(
                (claim) => !prevClaims.some((prev) => prev.id === claim.id),
              ),
            ]);
            setPage((prev) => prev + 1);
          }

          setHasMore(newClaims.length > 0);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading claims:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
        isFetching.current = false; // Allow next fetch
        setClaimRevised(false);
      }
    },
    [loading, hasMore, generatePayload, filterState, filterServiceCentre],
  );

  // Fetch claims in the background when triggered
  const refreshClaimsInBackground = useCallback(async () => {
    if (!refreshClaimsTrigger) return;
    setClaimRevised(false);

    try {
      const payload = generatePayload(0);
      if (payload.claim_type == "otherClaims") {
        payload.claim_type = "myClaims";
      }
      const response = await fetchClaims(payload);

      if (response.success && Array.isArray(response.data?.data?.claims)) {
        const newClaims = response.data.data.claims;

        setFilteredClaims((prevClaims) => {
          const updatedClaimsMap = new Map(
            prevClaims.map((claim) => [claim.id, claim]),
          );

          // Update existing claims or add new ones
          newClaims.forEach((newClaim) => {
            updatedClaimsMap.set(newClaim.id, newClaim);
          });

          const updatedClaims = Array.from(updatedClaimsMap.values());

          // Preserve selected claim if it still exists
          const existingSelectedClaim = updatedClaims.find(
            (claim) => claim.id === selectedClaim?.id,
          );

          if (existingSelectedClaim) {
            applyClaimSelection(existingSelectedClaim, notificationTargetTab);
            if (notificationTargetTab) {
              setNotificationTargetTab(null);
            }
          }

          return updatedClaims;
        });
      }
    } catch (error) {
      console.error("Background refresh failed:", error);
    }
  }, [
    refreshClaimsTrigger,
    generatePayload,
    selectedClaim,
    filterState,
    filterServiceCentre,
  ]);

  // Initial & Filter/Search API Call
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchClaimsData(0, true);
    isFetching.current = false;
  }, [
    appliedFilters,
    filterStatus,
    globalSearch,
    sortOrder,
    filterState,
    filterServiceCentre,
  ]);

  // Background refresh effect
  useEffect(() => {
    refreshClaimsInBackground();
  }, [refreshClaimsTrigger]);

  useEffect(() => {
    if (!selectedClaim) {
      // If there's no selected claim, select the first available claim
      if (filteredClaims.length > 0) {
        const firstClaim = filteredClaims[0];
        setClaimStates(firstClaim);
      } else {
        setSelectedClaim(null);
      }
    } else {
      // If the selected claim exists in the updated list, do nothing
      const stillExists = filteredClaims.some(
        (claim) => claim.id === selectedClaim.id,
      );
      if (!stillExists) {
        setSelectedClaim(filteredClaims[0] || null);
      }
    }
  }, [filteredClaims, globalSearch, sortOrder, filterState, filterServiceCentre]);

  const setClaimStates = (currentClaim: Claim) => {
    if (currentClaim) {
      applyClaimSelection(currentClaim, notificationTargetTab);
      if (notificationTargetTab) {
        setNotificationTargetTab(null);
      }
    }
  };

  // scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      if (target.isIntersecting && hasMore && !loading && !isFetching.current) {
        fetchClaimsData(page);
      }
    },
    [hasMore, loading, page, fetchClaimsData],
  );

  useEffect(() => {
    if (!lastClaimRef.current) return;

    observer.current?.disconnect();

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    observer.current.observe(lastClaimRef.current);

    return () => observer.current?.disconnect();
  }, [handleObserver]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <ul className="space-y-2">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim, index) => (
            <li
              key={claim.id}
              ref={index === filteredClaims.length - 1 ? lastClaimRef : null}
              className={`flex items-center justify-between shadow-sm p-4 ${
                selectedClaim?.id === claim.id
                  ? "bg-claimListBackground"
                  : "hover:bg-gray-50"
              } cursor-pointer ${
                actionRequiredStatus.includes(claim.status) ||
                claim?.isActionRequired
                  ? "border-l-4 border-primaryBlue"
                  : ""
              }`}
              onClick={() => {
                setClaimRevised(false);
                setClaimStates(claim);
              }}
            >
              <div>
                <div className="flex items-center">
                  <p className="text-base font-semibold text-gray-800 mr-2">
                    {claim.id}
                  </p>
                  {claim?.special_case && (
                    <div className="text-xxs text-red-500 mr-2 rounded-full border border-red-400 p-1">
                      {"Special Case"}
                    </div>
                  )}
                  {(actionRequiredStatus.includes(claim.status) ||
                    claim?.isActionRequired) && (
                    <Image
                      src="/images/action-required-icon.svg"
                      alt="Action required"
                      width={14}
                      height={14}
                    />
                  )}
                  {claim?.is_duplicate && (
                    <DuplicateClaimsIcon className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600">{claim.name}</p>
              </div>
              <div className="text-xs text-right">
                <span
                  className={`badge font-semibold ${
                    actionRequiredStatus.includes(claim.status) ||
                    claim?.isActionRequired
                      ? "bg-primaryBlue text-white"
                      : "bg-gray-200 text-gray-800"
                  } mb-1 text-xs px-4 py-[10px]`}
                >
                  {claim.status}
                </span>
                <p className="text-xs text-gray-500">
                  {formatDate(claim?.created_at)}
                </p>
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No claims found</p>
        )}
      </ul>

      {loading && (
        <p className="text-center text-gray-500 py-8">
          <span className="loading loading-ring loading-lg"></span>
        </p>
      )}
      {!hasMore && filteredClaims.length < 0 && (
        <p className="text-center text-gray-400 py-4">No more claims</p>
      )}
    </div>
  );
};

export default ClaimList;
