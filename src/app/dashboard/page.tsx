"use client";

import { useEffect, useState, useMemo } from "react";
import SearchSection from "@/components/SearchSection";
import ClaimFilter from "@/components/ClaimFilter";
import ClaimList from "@/components/ClaimList";
import ClaimDetails from "@/components/ClaimDetails";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Claim from "@/interfaces/ClaimInterface";

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
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All Claims");
  const [claimStatuses, setClaimStatuses] = useState<string[]>([]); // Dynamic API dropdown

  // Memoized Dummy Data
  const dummyClaims = useMemo(
    () => [
      {
        id: 18940,
        customer_name: "Radha Mohan",
        status: "Claim Initiated",
        date: "Today",
      },
      {
        id: 18941,
        customer_name: "Roney Kumar",
        status: "Claim Initiated",
        date: "Yesterday",
      },
      {
        id: 18948,
        customer_name: "Kavita Ronak",
        status: "BER Approved",
        date: "16/01/2025",
      },
    ],
    []
  );

  useEffect(() => {
    setClaims(dummyClaims);
    setFilteredClaims(dummyClaims);
    if (dummyClaims.length > 0) {
      setSelectedClaim(dummyClaims[0]); // Select first claim by default
    }
  }, [dummyClaims]);

  // Fetch claim statuses from API
  useEffect(() => {
    const fetchClaimStatuses = async () => {
      // try {
      //   const response = await fetch("/api/claim-statuses"); // Update with your API endpoint
      //   const data = await response.json();
      //   setClaimStatuses(data.statuses || []);
      // } catch (error) {
      //   console.error("Error fetching claim statuses:", error);
      // }
    };
    fetchClaimStatuses();
  }, []);

  // Search Functionality
  const handleSearch = (): void => {
    const searchResults = claims.filter(
      (claim) =>
        claim.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id.toString().includes(searchTerm) ||
        claim.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClaims(searchResults);
  };

  // Filter Change Handler
  const handleFilterChange = (filter: string): void => {
    setFilterStatus(filter);
    console.log("Selected filter:", filter);
    if (filter === "All Claims") {
      setFilteredClaims(claims);
    } else {
      const filteredResults = claims.filter(
        (claim) => claim.status.toLowerCase() === filter.toLowerCase()
      );
      setFilteredClaims(filteredResults);
    }
  };

  // Sorting Logic
  const handleSortingChange = (
    sortBy: keyof Claim,
    order: "Ascending" | "Descending"
  ): void => {
    console.log(sortBy, order);

    const sortedClaims = [...filteredClaims].sort((a, b) => {
      const valueA = a[sortBy] ?? "";
      const valueB = b[sortBy] ?? "";

      if (order === "Ascending") {
        return String(valueA).localeCompare(String(valueB));
      } else {
        return String(valueB).localeCompare(String(valueA));
      }
    });

    setFilteredClaims(sortedClaims);
  };

  const applyFilters = (filters: FilterProps): void => {
    console.log("Applied Filters:", filters);
    // Implement actual filter logic
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    console.log(filterStatus);
    console.log(claimStatuses);
  }, [filterStatus, claimStatuses]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onRefresh={() => window.location.reload()}
        onLogout={handleLogout}
      />
      {/* Search Section */}
      <SearchSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[0.8fr_2.2fr] gap-3 p-3 relative">
        {/* Left Sidebar */}
        <aside className="bg-white p-3 rounded-md shadow-sm overflow-auto max-h-[calc(100vh-128px)]">
          <ClaimFilter
            handleFilterChange={handleFilterChange}
            applyFilters={applyFilters}
            handleSortingChange={handleSortingChange}
          />
          <ClaimList
            claims={filteredClaims}
            selectedClaim={selectedClaim}
            setSelectedClaim={setSelectedClaim}
          />
        </aside>

        {/* Right Sidebar */}
        <main className="bg-white p-3 rounded-md shadow-sm overflow-auto">
          <ClaimDetails selectedClaim={selectedClaim} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
