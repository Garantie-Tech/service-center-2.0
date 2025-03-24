"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import { getActiveTab } from "@/helpers/globalHelper";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { fetchClaims } from "@/services/claimService";
import { ClaimFetchPayload } from "@/interfaces/GlobalInterface";
import Claim from "@/interfaces/ClaimInterface";

const ClaimList: React.FC = () => {
  const {
    filteredClaims,
    setFilteredClaims,
    selectedClaim,
    setSelectedClaim,
    setClaimStatus,
    setEstimateDetailsState,
    setApprovalDetails,
    setActiveTab,
    appliedFilters,
    filterStatus,
    setIsLoading,
    globalSearch,
    refreshClaimsTrigger,
    setClaimRevised,
    setClaimCount,
    claimTypes,
    sortOrder,
  } = useGlobalStore();

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastClaimRef = useRef<HTMLLIElement | null>(null);
  const isFetching = useRef(false);

  const actionRequiredStatus = useMemo(
    () => ["Invalid Documents", "Claim Initiated", "BER Marked"],
    []
  );

  // Generates API payload dynamically
  const generatePayload = useCallback(
    (pageNumber: number): ClaimFetchPayload => {
      const basePayload: ClaimFetchPayload = {
        page: pageNumber,
        partner_id: 191,
        source: "service_centre",
      };

      if (globalSearch) {
        basePayload.claim_search = globalSearch;
      } else {
        basePayload.claim_status = filterStatus || "ALL CLAIMS";

        if (appliedFilters?.fromDate && appliedFilters?.toDate) {
          basePayload.duration = "custom";
          basePayload.startDate = appliedFilters.fromDate;
          basePayload.endDate = appliedFilters.toDate;
        }

        const selectedClaimType = Object.entries(claimTypes).find(
          ([, value]) => value === true
        )?.[0];

        if (selectedClaimType) {
          basePayload.claim_type = selectedClaimType;
        }

        if (sortOrder) {
          basePayload.sort_by = sortOrder;
        }
      }

      return basePayload;
    },
    [appliedFilters, filterStatus, globalSearch, claimTypes, sortOrder]
  );

  // Fetch claims (main function)
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
                (claim) => !prevClaims.some((prev) => prev.id === claim.id)
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
    [loading, hasMore, generatePayload]
  );

  // Fetch claims in the background when triggered
  const refreshClaimsInBackground = useCallback(async () => {
    if (!refreshClaimsTrigger) return;
    setClaimRevised(false);

    try {
      const payload = generatePayload(0);
      const response = await fetchClaims(payload);

      if (response.success && Array.isArray(response.data?.data?.claims)) {
        const newClaims = response.data.data.claims;

        setFilteredClaims((prevClaims) => {
          const updatedClaimsMap = new Map(
            prevClaims.map((claim) => [claim.id, claim])
          );

          // Update existing claims or add new ones
          newClaims.forEach((newClaim) => {
            updatedClaimsMap.set(newClaim.id, newClaim);
          });

          const updatedClaims = Array.from(updatedClaimsMap.values());

          // Preserve selected claim if it still exists
          const existingSelectedClaim = updatedClaims.find(
            (claim) => claim.id === selectedClaim?.id
          );

          if (existingSelectedClaim) {
            setSelectedClaim(existingSelectedClaim);
            setClaimStatus(existingSelectedClaim.status);
            setActiveTab(
              getActiveTab(existingSelectedClaim.status) as
                | "Claim Details"
                | "Estimate"
                | "Approval"
                | "Final Documents"
                | "Customer Documents"
                | "Cancelled"
                | "Rejected"
                | "Settlement Details"
            );
            setClaimRevised(false);
          }

          return updatedClaims;
        });
      }
    } catch (error) {
      console.error("Background refresh failed:", error);
    }
  }, [refreshClaimsTrigger, generatePayload, selectedClaim]);

  // Initial & Filter/Search API Call
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchClaimsData(0, true);
  }, [appliedFilters, filterStatus, globalSearch, sortOrder]);

  // Background refresh effect
  useEffect(() => {
    refreshClaimsInBackground();
  }, [refreshClaimsTrigger]);

  // Infinite scrolling observer
  useEffect(() => {
    if (!lastClaimRef.current || !hasMore || loading) return;

    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchClaimsData(page);
        }
      },
      { threshold: 1.0 }
    );

    observer.current.observe(lastClaimRef.current);

    return () => observer.current?.disconnect();
  }, [page, hasMore, loading]);

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
        (claim) => claim.id === selectedClaim.id
      );
      if (!stillExists) {
        setSelectedClaim(filteredClaims[0] || null);
      }
    }
  }, [filteredClaims, globalSearch, sortOrder]);

  const setClaimStates = (currentClaim: Claim) => {
    if (currentClaim) {
      setSelectedClaim(currentClaim);
      setClaimStatus(currentClaim.status);
      setEstimateDetailsState({
        estimateAmount: currentClaim?.claimed_amount || "",
        jobSheetNumber: currentClaim?.job_sheet_number || "",
        estimateDetails: currentClaim?.data?.inputs?.estimate_details || "",
        replacementConfirmed: currentClaim?.imei_changed,
        damagePhotos: currentClaim?.mobile_damage_photos || [],
        estimateDocument: currentClaim?.documents?.["15"]?.url || null,
      });
      setApprovalDetails({
        estimateAmount: Number(currentClaim?.claimed_amount),
        approvedAmount: Number(currentClaim?.approved_amount),
        approvalType: currentClaim?.status,
        approvalDate: currentClaim?.approval_date,
        repairAmount: currentClaim?.repair_amount,
        repairPaymentSuccessful: currentClaim?.repair_payment_successful,
        repairPaymentLink: currentClaim?.repair_payment_link,
        repairRazorpayOrderId: currentClaim?.repair_razorpay_order_id,
        estimateDate: currentClaim?.estimated_date,
        replacementPaymentSuccessful:
          currentClaim?.data?.replacement_payment?.replace_payment_successful,
        replacementPaymentLink:
          currentClaim?.data?.replacement_payment?.replace_payment_link,
        replacementAmount:
          currentClaim?.data?.replacement_payment?.replace_amount,
      });
      setActiveTab(
        getActiveTab(currentClaim.status) as
          | "Claim Details"
          | "Estimate"
          | "Approval"
          | "Final Documents"
          | "Customer Documents"
          | "Cancelled"
          | "Rejected"
          | "Settlement Details"
      );
    }
  };

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
                actionRequiredStatus.includes(claim.status)
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
                  {actionRequiredStatus.includes(claim.status) && (
                    <Image
                      src="/images/action-required-icon.svg"
                      alt="Action required"
                      width={14}
                      height={14}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-600">{claim.name}</p>
              </div>
              <div className="text-xs text-right">
                <span
                  className={`badge font-semibold ${
                    actionRequiredStatus.includes(claim.status)
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
