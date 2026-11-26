"use client";

import Header from "@/components/Header";
import ServiceCentreManagement from "@/components/ServiceCentreManagement";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const ServiceCentresPage: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    setFilterState,
    setFilterServiceCentre,
    setSelectedDropdown,
  } = useGlobalStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (user.user_type !== "service_head") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router, user.user_type]);

  const handleLogout = () => {
    setFilterState("");
    setFilterServiceCentre("");
    setSelectedDropdown("All Claims");
    useAuthStore.getState().logout();
    router.push("/");
  };

  if (!isAuthenticated || user.user_type !== "service_head") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />
      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto mb-6 flex max-w-6xl items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-gray-600 transition hover:bg-white hover:text-gray-900"
            onClick={() => router.push("/dashboard")}
            aria-label="Back to dashboard"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm text-gray-500">Dashboard</span>
          <span className="text-sm text-gray-400">/</span>
          <span className="text-sm font-medium text-gray-900">Manage Service Centres</span>
        </div>
        <ServiceCentreManagement />
      </main>
    </div>
  );
};

export default ServiceCentresPage;
