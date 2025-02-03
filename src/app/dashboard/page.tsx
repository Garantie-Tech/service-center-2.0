"use client";

import { useEffect, useState } from "react";
import SearchSection from "@/components/SearchSection";
import ClaimFilter from "@/components/ClaimFilter";
import ClaimList from "@/components/ClaimList";
import ClaimDetails from "@/components/ClaimDetails";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Claim from "@/interfaces/ClaimInterface";
import { fetchClaims } from "@/services/claimService";
import { useGlobalStore } from "@/store/store";

interface FilterProps {
  fromDate: string;
  toDate: string;
  claimTypes: {
    myClaims: boolean;
    otherClaims: boolean;
    pendingClaims: boolean;
  };
}

const Dashboard: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false); // Prevents hydration issues
  const setIsLoading = useGlobalStore((state) => state.setIsLoading);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All Claims");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const claimStatuses: { [key: string]: string } = {
    "ALL CLAIMS": "All Claims",
    NEW: "Estimate Pending",
    "IN PROGRESS": "Approval Pending",
    APPROVED: "Approved",
    "PAYMENT PENDING": "Payment Pending",
    REJECTED: "Rejected",
    CLOSED: "Completed",
    CANCELLED: "Cancelled",
  };

  useEffect(() => {
    if (!hasMounted || Object.keys(claimStatuses).length === 0) return; // Ensures hydration happens first

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
        } else {
          console.error("Error fetching claims:", response.error);
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaimsData();
  }, [filterStatus, hasMounted]);

  if (!hasMounted) return null; // Prevent rendering until fully mounted

  const handleSearch = (): void => {
    const searchResults = claims.filter(
      (claim) =>
        claim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id.toString().includes(searchTerm) ||
        claim.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClaims(searchResults);
  };

  const handleFilterChange = (filter: string): void => {
    setFilterStatus(filter);
    if (filter === "ALL CLAIMS") {
      setFilteredClaims(claims);
    } else {
      setFilteredClaims(
        claims.filter(
          (claim) => claim.status.toLowerCase() === filter.toLowerCase()
        )
      );
    }
  };

  const handleSortingChange = (
    sortBy: keyof Claim,
    order: "Ascending" | "Descending"
  ): void => {
    const sortedClaims = [...filteredClaims].sort((a, b) => {
      const valueA = a[sortBy] ?? "";
      const valueB = b[sortBy] ?? "";

      return order === "Ascending"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setFilteredClaims(sortedClaims);
  };

  const applyFilters = (filters: FilterProps): void => {
    const { fromDate, toDate } = filters;
    const from = new Date(fromDate);
    const to = new Date(toDate);

    const filteredResults = claims.filter((claim) => {
      const claimDate = new Date(claim?.created_at);
      return claimDate >= from && claimDate <= to;
    });

    setFilteredClaims(filteredResults);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onRefresh={() => window.location.reload()} onLogout={handleLogout} />
      <SearchSection onRefresh={() => window.location.reload()} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[0.8fr_2.2fr] gap-3 p-3 relative">
        <aside className="bg-white p-3 pt-0 rounded-md shadow-sm overflow-auto max-h-[calc(100vh-128px)]">
          <ClaimFilter
            claimStatuses={claimStatuses}
            handleFilterChange={handleFilterChange}
            applyFilters={applyFilters}
            handleSortingChange={handleSortingChange}
          />
          <ClaimList claims={filteredClaims} selectedClaim={selectedClaim} setSelectedClaim={setSelectedClaim} />
        </aside>
        <main className="bg-white p-3 rounded-md shadow-sm overflow-auto">
          <ClaimDetails selectedClaim={selectedClaim} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
