"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import { getActiveTab } from "@/helpers/globalHelper";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { fetchClaims } from "@/services/claimService";
import { ClaimFetchPayload } from "@/interfaces/GlobalInterface";

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
        basePayload.claim_search = globalSearch; // Include globalSearch, exclude other filters
      } else {
        basePayload.claim_status = filterStatus || "ALL CLAIMS"; // Default claim status
  
        if (appliedFilters?.fromDate && appliedFilters?.toDate) {
          basePayload.duration = "custom";
          basePayload.startDate = appliedFilters.fromDate;
          basePayload.endDate = appliedFilters.toDate;
        }
      }
  
      return basePayload;
    },
    [appliedFilters, filterStatus, globalSearch]
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

          if (reset) {
            setFilteredClaims(newClaims);
            setPage(1); // Reset pagination
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
  }, [appliedFilters, filterStatus, globalSearch]);

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
        setSelectedClaim(firstClaim);
        setClaimStatus(firstClaim.status);
        setEstimateDetailsState({
          estimateAmount: firstClaim?.claimed_amount || "",
          jobSheetNumber: firstClaim?.job_sheet_number || "",
          estimateDetails: firstClaim?.data?.inputs?.estimate_details || "",
          replacementConfirmed: "",
          damagePhotos: firstClaim?.mobile_damage_photos || [],
          estimateDocument: firstClaim?.documents?.["15"]?.url || null,
        });
        setApprovalDetails({
          estimateAmount: Number(firstClaim?.claimed_amount),
          approvedAmount: Number(firstClaim?.approved_amount),
          approvalType: firstClaim?.status,
          approvalDate: firstClaim?.approval_date,
          repairAmount: firstClaim?.repair_amount,
          repairPaymentSuccessful: firstClaim?.repair_payment_successful,
          repairPaymentLink: firstClaim?.repair_payment_link,
          repairRazorpayOrderId: firstClaim?.repair_razorpay_order_id,
        });
        setActiveTab(
          getActiveTab(firstClaim.status) as
            | "Claim Details"
            | "Estimate"
            | "Approval"
            | "Final Documents"
            | "Customer Documents"
            | "Cancelled"
            | "Rejected"
        );
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
  }, [filteredClaims]);

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
                  ? "border-l-4 border-primaryBlue bg-claimListBackground"
                  : ""
              }`}
              onClick={() => {
                setClaimRevised(false);
                setSelectedClaim(claim);
                setClaimStatus(claim.status);
                setActiveTab(
                  getActiveTab(claim.status) as
                    | "Claim Details"
                    | "Estimate"
                    | "Approval"
                    | "Final Documents"
                    | "Customer Documents"
                    | "Cancelled"
                    | "Rejected"
                );
                setEstimateDetailsState({
                  estimateAmount: claim.claimed_amount || "",
                  jobSheetNumber: claim.job_sheet_number || "",
                  estimateDetails: claim.data?.inputs?.estimate_details || "",
                  replacementConfirmed: "",
                  damagePhotos: claim.mobile_damage_photos || [],
                  estimateDocument: claim.documents?.["15"]?.url || null,
                });
                setApprovalDetails({
                  estimateAmount: Number(claim.claimed_amount),
                  approvedAmount: Number(claim.approved_amount),
                  approvalType: claim.status,
                  approvalDate: claim.approval_date,
                  repairAmount: claim.repair_amount,
                  repairPaymentSuccessful: claim.repair_payment_successful,
                  repairPaymentLink: claim.repair_payment_link,
                  repairRazorpayOrderId: claim.repair_razorpay_order_id,
                });
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
      {!hasMore && filteredClaims.length > 0 && (
        <p className="text-center text-gray-400 py-4">No more claims</p>
      )}
    </div>
  );
};

export default ClaimList;
