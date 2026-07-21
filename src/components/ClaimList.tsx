"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  fetchClaims,
  fetchShipmentEligibleClaims,
} from "@/services/claimService";
import { ClaimFetchPayload } from "@/interfaces/GlobalInterface";
import Claim from "@/interfaces/ClaimInterface";
import { DuplicateClaimsIcon } from "./icons/Icons";
import { applyClaimSelection } from "@/helpers/claimSelectionHelper";

interface ClaimListProps {
  shipmentMode?: boolean;
}

const ClaimList: React.FC<ClaimListProps> = ({ shipmentMode = false }) => {
  const {
    claims,
    setClaims,
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
    shipmentSelectedClaimIds,
    toggleShipmentClaimSelection,
    clearShipmentSelection,
  } = useGlobalStore();

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastClaimRef = useRef<HTMLLIElement | null>(null);
  const isFetching = useRef(false);
  const claimsRef = useRef<Claim[]>([]);

  const actionRequiredStatus = useMemo(
    () => ["Invalid Documents", "Claim Initiated", "BER Marked"],
    [],
  );

  useEffect(() => {
    claimsRef.current = claims;
  }, [claims]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const setClaimStates = useCallback(
    (currentClaim: Claim) => {
      if (!currentClaim) {
        return;
      }

      applyClaimSelection(currentClaim, notificationTargetTab);
    },
    [notificationTargetTab],
  );

  const generatePayload = useCallback(
    (pageNumber: number): ClaimFetchPayload => {
      const basePayload: ClaimFetchPayload = {
        page: pageNumber,
        partner_id: 191,
        source: "service_centre",
      };

      if (shipmentMode) {
        basePayload.shipment_mode = true;
        basePayload.claim_search = globalSearch || "";

        if (appliedFilters?.fromDate && appliedFilters?.toDate) {
          basePayload.duration = "custom";
          basePayload.startDate = appliedFilters.fromDate;
          basePayload.endDate = appliedFilters.toDate;
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

        return basePayload;
      }

      const user = localStorage.getItem("user");
      let serviceCenter: { user_type?: string } | null = null;

      try {
        serviceCenter = user ? JSON.parse(user) : null;
      } catch (error) {
        console.error("Invalid user data in localStorage", error);
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
      claimTypes,
      filterServiceCentre,
      filterState,
      filterStatus,
      globalSearch,
      shipmentMode,
      sortOrder,
    ],
  );

  const fetchClaimsData = useCallback(
    async (pageNumber: number, reset: boolean = false) => {
      if (loadingRef.current || (!hasMoreRef.current && !reset) || isFetching.current) {
        return;
      }

      isFetching.current = true;
      loadingRef.current = true;
      setLoading(true);
      setIsLoading(true);

      try {
        const payload = generatePayload(pageNumber);
        const response = shipmentMode
          ? await fetchShipmentEligibleClaims(payload)
          : await fetchClaims(payload);

        if (response.success && Array.isArray(response.data?.data?.claims)) {
          const newClaims = response.data.data.claims;
          const claimCount = response.data.data.totalCount;
          setClaimCount(Number(claimCount));

          if (reset) {
            setClaims(newClaims);
            setFilteredClaims(newClaims);
            pageRef.current = 1;

            if (newClaims.length > 0) {
              setClaimStates(newClaims[0]);
            } else {
              setSelectedClaim(null);
            }

            if (shipmentMode) {
              clearShipmentSelection();
            }
          } else {
            const mergedClaims = [
              ...claimsRef.current,
              ...newClaims.filter(
                (claim) => !claimsRef.current.some((prev) => prev.id === claim.id),
              ),
            ];

            setClaims(mergedClaims);
            setFilteredClaims(mergedClaims);
            pageRef.current += 1;
          }

          hasMoreRef.current = newClaims.length > 0;
          setHasMore(newClaims.length > 0);
        } else {
          hasMoreRef.current = false;
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading claims:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
        loadingRef.current = false;
        isFetching.current = false;
        setClaimRevised(false);
      }
    },
    [
      clearShipmentSelection,
      generatePayload,
      setClaimCount,
      setClaimRevised,
      setClaims,
      setFilteredClaims,
      setIsLoading,
      setSelectedClaim,
      setClaimStates,
      shipmentMode,
    ],
  );

  const refreshClaimsInBackground = useCallback(async () => {
    if (!refreshClaimsTrigger) {
      return;
    }

    setClaimRevised(false);

    try {
      const payload = generatePayload(0);
      if (payload.claim_type === "otherClaims") {
        payload.claim_type = "myClaims";
      }

      const response = shipmentMode
        ? await fetchShipmentEligibleClaims(payload)
        : await fetchClaims(payload);

      if (response.success && Array.isArray(response.data?.data?.claims)) {
        const newClaims = response.data.data.claims;
        const updatedClaimsMap = new Map(
          claimsRef.current.map((claim) => [claim.id, claim]),
        );

        newClaims.forEach((newClaim) => {
          updatedClaimsMap.set(newClaim.id, newClaim);
        });

        const updatedClaims = Array.from(updatedClaimsMap.values());

        setClaims(updatedClaims);
        setFilteredClaims(updatedClaims);

        const existingSelectedClaim = updatedClaims.find(
          (claim) => claim.id === selectedClaim?.id,
        );

        if (existingSelectedClaim) {
          setClaimStates(existingSelectedClaim);
        }
      }
    } catch (error) {
      console.error("Background refresh failed:", error);
    }
  }, [
    claimsRef,
    generatePayload,
    refreshClaimsTrigger,
    selectedClaim,
    setClaimStates,
    setClaims,
    setFilteredClaims,
    setClaimRevised,
    shipmentMode,
  ]);

  useEffect(() => {
    pageRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    fetchClaimsData(0, true);
    isFetching.current = false;
  }, [
    appliedFilters,
    fetchClaimsData,
    filterServiceCentre,
    filterState,
    filterStatus,
    globalSearch,
    shipmentMode,
    sortOrder,
  ]);

  useEffect(() => {
    refreshClaimsInBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshClaimsTrigger]);

  useEffect(() => {
    if (!selectedClaim) {
      if (filteredClaims.length > 0) {
        setClaimStates(filteredClaims[0]);
      } else {
        setSelectedClaim(null);
      }
      return;
    }

    const stillExists = filteredClaims.some(
      (claim) => claim.id === selectedClaim.id,
    );

    if (!stillExists) {
      if (filteredClaims.length > 0) {
        setClaimStates(filteredClaims[0]);
      } else {
        setSelectedClaim(null);
      }
    }
  }, [
    filteredClaims,
    selectedClaim,
    setClaimStates,
    setSelectedClaim,
  ]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      if (
        target.isIntersecting &&
        hasMoreRef.current &&
        !loadingRef.current &&
        !isFetching.current
      ) {
        fetchClaimsData(pageRef.current);
      }
    },
    [fetchClaimsData],
  );

  useEffect(() => {
    if (!lastClaimRef.current) {
      return;
    }

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
              className={`flex items-center justify-between gap-3 shadow-sm p-4 ${
                selectedClaim?.id === claim.id
                  ? "bg-claimListBackground"
                  : "hover:bg-gray-50"
              } cursor-pointer ${
                actionRequiredStatus.includes(claim.status) ||
                claim?.isActionRequired
                  ? "border-l-4 border-primaryBlue"
                  : ""
              } ${
                shipmentMode &&
                shipmentSelectedClaimIds.includes(Number(claim.id))
                  ? "bg-blue-50"
                  : ""
              }`}
              onClick={() => {
                setClaimStates(claim);
              }}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {shipmentMode && (
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={shipmentSelectedClaimIds.includes(
                        Number(claim.id),
                      )}
                      disabled={!claim.office_shipment_eligible}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        event.stopPropagation();
                        toggleShipmentClaimSelection(Number(claim.id));
                      }}
                      title={
                        claim.office_shipment_eligible
                          ? "Select for shipment"
                          : claim.office_shipment_ineligibility_reason ||
                            "Not eligible for shipment"
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center">
                    <p className="text-base font-semibold text-gray-800 mr-2">
                      {claim.id}
                    </p>
                    {claim?.claim_type === "Special Approval" && (
                      <div className="text-xxs text-red-500 mr-2 rounded-full border border-red-400 p-1">
                        Special Case
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
      {!hasMore && filteredClaims.length > 0 && (
        <p className="text-center text-gray-400 py-4">No more claims</p>
      )}
    </div>
  );
};

export default ClaimList;
