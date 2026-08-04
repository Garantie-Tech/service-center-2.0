"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import { hasNoidaShipmentAccess } from "@/helpers/globalHelper";
import useSyncAuthenticatedProfile from "@/hooks/useSyncAuthenticatedProfile";

const SearchSection = dynamic(() => import("@/components/SearchSection"), {
  ssr: false,
});
const ClaimFilter = dynamic(() => import("@/components/ClaimFilter"), {
  ssr: false,
});
const ClaimList = dynamic(() => import("@/components/ClaimList"), {
  ssr: false,
});
const BulkShipmentDetails = dynamic(
  () => import("@/components/shipment/BulkShipmentDetails"),
  {
    ssr: false,
  },
);
const Header = dynamic(() => import("@/components/Header"), { ssr: false });

const BulkShipmentPage: React.FC = () => {
  const router = useRouter();
  const isAuthReady = useSyncAuthenticatedProfile();
  const {
    selectedClaim,
    setFilterState,
    setFilterServiceCentre,
    setFilterStatus,
    setSelectedDropdown,
    clearShipmentSelection,
  } = useGlobalStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const hasShipmentAccess = hasNoidaShipmentAccess(user);

  useEffect(() => {
    setFilterStatus("pending");
    setSelectedDropdown("pending");
    clearShipmentSelection();
    return () => {
      setFilterStatus("");
      setSelectedDropdown("All Claims");
      clearShipmentSelection();
    };
  }, [clearShipmentSelection, setFilterStatus, setSelectedDropdown]);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!hasShipmentAccess) {
      router.replace("/dashboard");
    }
  }, [hasShipmentAccess, isAuthReady, router]);

  if (!isAuthReady) {
    return null;
  }

  if (!hasShipmentAccess) {
    return null;
  }

  const handleLogout = () => {
    setFilterState("");
    setFilterServiceCentre("");
    setSelectedDropdown("All Claims");
    clearShipmentSelection();
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={handleLogout} />

      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Shipment Workspace
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Bulk Shipment
            </h1>
            <p className="text-sm text-gray-500">
              View shipment-eligible claims, then initiate individual or bulk shipment from here.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <SearchSection
        shipmentActionsEnabled
        shipmentMode
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[0.8fr_2.2fr] gap-3 p-3 relative">
        <aside className="bg-white p-3 pt-0 rounded-md shadow-sm overflow-auto max-h-[calc(100vh)]">
          <ClaimFilter shipmentMode />
          <ClaimList shipmentMode />
        </aside>
        <main className="bg-white rounded-md shadow-sm overflow-auto pb-[500px] md:pb-[20px]">
          <BulkShipmentDetails selectedClaim={selectedClaim} />
        </main>
      </div>
    </div>
  );
};

export default BulkShipmentPage;
