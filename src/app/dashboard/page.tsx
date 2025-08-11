"use client";

import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store/store";
// import NoticeMarquee from "@/components/NoticeMarquee";

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
  const router = useRouter();
  const { selectedClaim, setFilterState, setSelectedDropdown } =
    useGlobalStore();

  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    setFilterState("");
    setSelectedDropdown("All Claims");
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={handleLogout} />
      <SearchSection />
      {/* <NoticeMarquee message="Please note that our office will remain closed on Saturday, 9th August 2025 in observance of Raksha Bandhan. We will resume normal operations on Monday, 11th August 2025. Wishing you a joyful and blessed Raksha Bandhan! 🎉" /> */}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[0.8fr_2.2fr] gap-3 p-3 relative">
        <aside className="bg-white p-3 pt-0 rounded-md shadow-sm overflow-auto max-h-[calc(100vh)]">
          <ClaimFilter />
          <ClaimList />
        </aside>
        <main className="bg-white rounded-md shadow-sm overflow-auto pb-[500px] md:pb-[20px]">
          <ClaimDetails selectedClaim={selectedClaim} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
