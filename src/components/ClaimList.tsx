"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { formatDate } from "@/helpers/dateHelper";
import { getActiveTab } from "@/helpers/globalHelper";
import { useEffect, useRef, useState, useCallback } from "react";
import { fetchClaims } from "@/services/claimService";
import Claim from "@/interfaces/ClaimInterface";

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
  } = useGlobalStore();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastClaimRef = useRef<HTMLLIElement | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Claim Initiated":
      case "Invalid Documents":
      case "BER":
        return "bg-primaryBlue text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const loadMoreClaims = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await fetchClaims({
        page,
        partner_id: 191,
        date: "allTime",
        source: "service_centre",
      });

      if (response.success && Array.isArray(response.data?.data?.claims)) {
        const newClaims: Claim[] = response.data.data.claims.map((claim) => ({
          ...claim,
          claimed_amount: claim.claimed_amount ?? "",
        }));

        if (newClaims.length === 0) {
          setHasMore(false);
        } else {
          setFilteredClaims((prevClaims) => [...prevClaims, ...newClaims]);
          setPage((prevPage) => prevPage + 1);
        }
      }
    } catch (error) {
      console.error("Error loading more claims:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, setFilteredClaims]);

  useEffect(() => {
    if (!lastClaimRef.current) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreClaims();
        }
      },
      { threshold: 1.0 }
    );

    if (lastClaimRef.current) {
      observer.current.observe(lastClaimRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [filteredClaims.length, hasMore, loadMoreClaims]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <ul className="space-y-2">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim, index) => (
            <li
              key={claim.id}
              ref={index === filteredClaims.length - 1 ? lastClaimRef : null}
              className={`flex items-center justify-between shadow-sm p-4 ${
                selectedClaim?.id === claim.id ? "bg-claimListBackground" : "hover:bg-gray-50"
              } cursor-pointer ${
                ["Invalid Documents", "Claim Initiated", "BER"].includes(claim.status)
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
                  <p className="text-base font-semibold text-gray-800 mr-2">{claim.id}</p>
                  {["Invalid Documents", "Claim Initiated", "BER"].includes(claim.status) && (
                    <Image src="/images/action-required-icon.svg" alt="Action required" width={14} height={14} />
                  )}
                </div>
                <p className="text-xs text-gray-600">{claim.name}</p>
              </div>
              <div className="text-xs text-right">
                <span className={`badge font-semibold ${getStatusBadge(claim.status)} mb-1 text-xs px-4 py-[10px]`}>
                  {claim.status}
                </span>
                <p className="text-xs text-gray-500">{formatDate(claim?.created_at)}</p>
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No claims found</p>
        )}
      </ul>

      {loading && <p className="text-center text-gray-500 py-8">
        <span className="loading loading-ring loading-lg"></span>
        </p>}
      {!hasMore && <p className="text-center text-gray-400 py-4">No more claims</p>}
    </div>
  );
};

export default ClaimList;
