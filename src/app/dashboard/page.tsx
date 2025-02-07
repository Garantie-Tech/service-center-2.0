"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { fetchClaims } from "@/services/claimService";
import { useGlobalStore } from "@/store/store";
import { useRouter } from "next/navigation";

// Dynamically import components for performance optimization
const SearchSection = dynamic(() => import("@/components/SearchSection"), { ssr: false });
const ClaimFilter = dynamic(() => import("@/components/ClaimFilter"), { ssr: false });
const ClaimList = dynamic(() => import("@/components/ClaimList"), { ssr: false });
const ClaimDetails = dynamic(() => import("@/components/ClaimDetails"), { ssr: false });
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
  } = useGlobalStore();

  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    logout();
    router.push('/');
  }

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
  ]); // ✅ Added missing dependencies

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onRefresh={() => window.location.reload()} onLogout={handleLogout} />
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
