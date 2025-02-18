"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { fetchClaims } from "@/services/claimService";
import { useGlobalStore } from "@/store/store";
import { useRouter } from "next/navigation";

// Dynamically import components for performance optimization
const SearchSection = dynamic(() => import("@/components/SearchSection"), {
  ssr: false,
});
const ClaimFilter = dynamic(() => import("@/components/ClaimFilter"), {
  ssr: false,
});
const ClaimList = dynamic(() => import("@/components/ClaimList"), {
  ssr: false,
});
const ClaimDetails = dynamic(() => import("@/components/ClaimDetails"), {
  ssr: false,
});
const Header = dynamic(() => import("@/components/Header"), { ssr: false });

const Dashboard: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const {
    setIsLoading,
    setClaims,
    setFilteredClaims,
    setSelectedClaim,
    filterStatus,
    claimStatuses,
    setClaimStatus,
    setEstimateDetailsState,
    setApprovalDetails
  } = useGlobalStore();

  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || Object.keys(claimStatuses).length === 0) return;

    const fetchClaimsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchClaims({
          page: 0,
          partner_id: 191,
          date: "allTime",
          source: "service_centre",
          claim_status: filterStatus,
        });

        if (response.success && response.data?.data?.claims) {
          const mappedClaims = response.data.data.claims.map((claim) => ({
            ...claim,
            status: claimStatuses[claim.status] || claim.status,
          }));

          setClaims(mappedClaims);
          setFilteredClaims(mappedClaims);
          if (mappedClaims.length > 0) {
            setSelectedClaim(mappedClaims[0]);
            setClaimStatus(mappedClaims[0]["status"]);
            setEstimateDetailsState({
              estimateAmount: mappedClaims[0]?.claimed_amount || "",
              jobSheetNumber: mappedClaims[0]?.job_sheet_number || "",
              estimateDetails: mappedClaims[0]?.data?.inputs?.estimate_details || "",
              replacementConfirmed: mappedClaims[0]?.imei_changed ? 'yes' : "no",
              damagePhotos: mappedClaims[0]?.mobile_damage_photos || [],
              estimateDocument: mappedClaims[0]?.documents?.["15"]?.url || null,
            });
            setApprovalDetails({
              estimateAmount:Number(mappedClaims[0]?.claimed_amount),
              approvedAmount:Number(mappedClaims[0]?.approved_amount),
              approvalType: mappedClaims[0]?.status,
              approvalDate: mappedClaims[0]?.approval_date,
              repairAmount: mappedClaims[0]?.repair_amount,
              repairPaymentSuccessful: mappedClaims[0]?.repair_payment_successful,
              repairPaymentLink: mappedClaims[0]?.repair_payment_link,
              repairRazorpayOrderId: mappedClaims[0]?.repair_razorpay_order_id,
            });
          }
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaimsData();
  }, [
    filterStatus,
    hasMounted,
    claimStatuses,
    setClaims,
    setFilteredClaims,
    setSelectedClaim,
    setIsLoading,
    setApprovalDetails,
    setClaimStatus,
    setEstimateDetailsState,
    
  ]);

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={handleLogout} />
      <SearchSection />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[0.8fr_2.2fr] gap-3 p-3 relative">
        <aside className="bg-white p-3 pt-0 rounded-md shadow-sm overflow-auto max-h-[calc(100vh-128px)]">
          <ClaimFilter />
          <ClaimList />
        </aside>
        <main className="bg-white rounded-md shadow-sm overflow-auto">
          <ClaimDetails />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
