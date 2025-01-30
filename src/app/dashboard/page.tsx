"use client";

import { useEffect, useState } from "react";
import SearchSection from "@/components/SearchSection";
import ClaimFilter from "@/components/ClaimFilter";
import ClaimList from "@/components/ClaimList";
import ClaimDetails from "@/components/ClaimDetails";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface Claim {
  id: number;
  customer_name: string;
  status: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All Claims");

  // Dummy data
  const dummyClaims: Claim[] = [
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
    // Add more claims as needed...
  ];

  useEffect(() => {
    setClaims(dummyClaims);
    setFilteredClaims(dummyClaims);
    if (dummyClaims.length > 0) {
      setSelectedClaim(dummyClaims[0]); // Select the first claim by default
    }
  }, []);

  const handleSearch = (): void => {
    const searchResults = claims.filter(
      (claim) =>
        claim.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id.toString().includes(searchTerm) ||
        claim.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClaims(searchResults);
  };

  const handleFilterChange = (filter: string): void => {
    setFilterStatus(filter);
    if (filter === "All Claims") {
      setFilteredClaims(claims);
    } else {
      const filteredResults = claims.filter(
        (claim) => claim.status.toLowerCase() === filter.toLowerCase()
      );
      setFilteredClaims(filteredResults);
    }
  };

  const applyFilters = (filters: any) => {
    console.log("Applied Filters:", filters);
    // Add your logic to apply filters (e.g., update state, fetch data, etc.)
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
            filterStatus={filterStatus}
            handleFilterChange={(value) => setFilterStatus(value)}
            applyFilters={applyFilters} // Pass the function here
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
