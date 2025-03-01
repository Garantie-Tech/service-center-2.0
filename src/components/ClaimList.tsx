"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import { getActiveTab } from "@/helpers/globalHelper";
import { useEffect, useRef, useState, useCallback } from "react";
import { fetchClaims } from "@/services/claimService";
import { ClaimFetchPayload } from "@/interfaces/GlobalInterface";

const ClaimList: React.FC = () => {
  const {
    filteredClaims = [],
    selectedClaim,
    setSelectedClaim,
    setClaimStatus,
    setEstimateDetailsState,
    setApprovalDetails,
    setActiveTab,
    setFilteredClaims,
    appliedFilters,
    filterStatus,
    setIsLoading,
    selectedDropdown,
    globalSearch,
  } = useGlobalStore();

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastClaimRef = useRef<HTMLLIElement | null>(null);
  const isInitialLoad = useRef(true);
  const actionRequiredStatus = [
    "Invalid Documents",
    "Claim Initiated",
    "BER Marked",
  ];

  const loadMoreClaims = useCallback(
    async (pageNumber: number, reset: boolean = false) => {
      if (loading || (!hasMore && !reset)) return;
      setLoading(true);
      setIsLoading(true);

      try {
        const payload: ClaimFetchPayload = {
          page: pageNumber,
          partner_id: 191,
          source: "service_centre",
          claim_status: filterStatus || "ALL CLAIMS",
        };

        if (appliedFilters?.fromDate && appliedFilters?.toDate) {
          payload.duration = "custom";
          payload.startDate = appliedFilters.fromDate;
          payload.endDate = appliedFilters.toDate;
        } else {
          payload.date = "allTime";
        }
        if (globalSearch) {
          payload.claim_search = globalSearch;
        }

        const response = await fetchClaims(payload);

        if (response.success && Array.isArray(response.data?.data?.claims)) {
          const newClaims = response.data.data.claims;

          if (newClaims.length === 0) {
            if (reset) {
              setFilteredClaims([]);
              setSelectedClaim(null);
            }
            setHasMore(false);
          } else {
            setFilteredClaims((prevClaims) => {
              if (reset) return newClaims;

              const uniqueClaims = newClaims.filter(
                (claim) => !prevClaims.some((prev) => prev.id === claim.id)
              );

              return [...prevClaims, ...uniqueClaims];
            });

            if (!reset) {
              setPage((prevPage) => prevPage + 1);
            }
          }
        }
      } catch (error) {
        console.error("Error loading more claims:", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    },
    [
      loading,
      hasMore,
      setFilteredClaims,
      appliedFilters,
      selectedDropdown,
      globalSearch,
    ]
  );

  useEffect(() => {
    if (!isInitialLoad.current) {
      setPage(0);
      setHasMore(true);
      setFilteredClaims([]);

      const delayDebounce = setTimeout(() => {
        loadMoreClaims(0, true);
      }, 300);

      return () => clearTimeout(delayDebounce);
    }
    isInitialLoad.current = false;
  }, [appliedFilters, filterStatus, selectedDropdown, globalSearch]);

  // infinite scroll
  useEffect(() => {
    if (!lastClaimRef.current || !hasMore || loading) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreClaims(page);
        }
      },
      { threshold: 1.0 }
    );

    if (lastClaimRef.current) {
      observer.current.observe(lastClaimRef.current);
    }

    if (filteredClaims.length > 0) {
      setSelectedClaim(filteredClaims[0]);
      setClaimStatus(filteredClaims[0]["status"]);
      setEstimateDetailsState({
        estimateAmount: filteredClaims[0]?.claimed_amount || "",
        jobSheetNumber: filteredClaims[0]?.job_sheet_number || "",
        estimateDetails:
          filteredClaims[0]?.data?.inputs?.estimate_details || "",
        replacementConfirmed: filteredClaims[0]?.imei_changed ? "yes" : "no",
        damagePhotos: filteredClaims[0]?.mobile_damage_photos || [],
        estimateDocument: filteredClaims[0]?.documents?.["15"]?.url || null,
      });
      setApprovalDetails({
        estimateAmount: Number(filteredClaims[0]?.claimed_amount),
        approvedAmount: Number(filteredClaims[0]?.approved_amount),
        approvalType: filteredClaims[0]?.status,
        approvalDate: filteredClaims[0]?.approval_date,
        repairAmount: filteredClaims[0]?.repair_amount,
        repairPaymentSuccessful: filteredClaims[0]?.repair_payment_successful,
        repairPaymentLink: filteredClaims[0]?.repair_payment_link,
        repairRazorpayOrderId: filteredClaims[0]?.repair_razorpay_order_id,
      });
      setActiveTab(
        getActiveTab(filteredClaims[0]?.status) as
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

    return () => observer.current?.disconnect();
  }, [page, hasMore, loading]);

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
                  replacementConfirmed: claim.imei_changed ? "yes" : "no",
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
