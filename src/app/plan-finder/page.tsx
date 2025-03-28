"use client";

import Header from "@/components/Header";
import { useNotification } from "@/context/NotificationProvider";
import { isIMEIFormat } from "@/helpers/globalHelper";
import { PolicyItem } from "@/interfaces/GlobalInterface";
import { fetchPlans } from "@/services/claimService";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const PlanFinder = () => {
  const [plans, setPlans] = useState<PolicyItem[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { setIsLoading } = useGlobalStore();
  const router = useRouter();
  const { notifyError } = useNotification();

  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSearch = async (term?: string) => {
    const search = term ?? searchTerm;

    if (search) {
      if (isIMEIFormat(search)) {
        try {
          setIsLoading(true);
          const response = await fetchPlans({ search_plan: search });
          if (response.success && response?.data?.data?.policies) {
            setPlans(response.data.data.policies ?? null);
          } else {
            setPlans(null);
          }
        } catch (error) {
          console.error("Failed to fetch plan:", error);
          setPlans(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        notifyError("Please Enter Valid IMEI Number!");
      }
    } else {
      // If search is empty, clear plans
      setPlans(null);
    }
  };

  return (
    <div>
      <Header onLogout={handleLogout} />
      <div>
        <div className="border-b px-[50px] py-[30px] flex justify-between gap-3">
          {/* Profile Heading */}
          <div className="w-1/2 flex items-center gap-3">
            <Image
              src="/images/chevron-down.svg"
              alt="chevron"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => {
                router.push("/dashboard");
              }}
            />
            <h2 className="text-xl font-semibold text-black">Plan Finder</h2>
          </div>

          {/* search */}
          <div className="relative w-1/4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IMEI number"
              className="input input-bordered w-full text-xs pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  handleSearch("");
                }}
                className="absolute inset-y-0 right-10 flex items-center text-gray-500 hover:text-gray-800 tooltip"
                data-tip="Clear Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-800 tooltip"
              data-tip="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-[50px] py-[30px]">
          <div className="overflow-x-auto rounded-md border border-base-content/5 bg-base-100">
            <table className="table border rounded-md">
              {/* head */}
              <thead>
                <tr className="bg-base-200 text-base font-semibold text-darkGray">
                  <th>Plan Name</th>
                  <th>Plan Duration</th>
                  <th>Name</th>
                  <th>IEMI 1</th>
                  <th>Model</th>
                  <th>Device MOP</th>
                </tr>
              </thead>
              <tbody>
                {plans && plans.length > 0 ? (
                  plans.map((plan, index) => (
                    <tr
                      className="text-base font-base text-[#3F3F3F]"
                      key={plan.id || index}
                    >
                      <td className="text-black font-semibold">
                        {plan.product_name}
                      </td>
                      <td>
                        {plan.start_date} to {plan.end_date}
                      </td>
                      <td>{plan.name}</td>
                      <td>{plan.imei_number}</td>
                      <td>{plan.phone_model}</td>
                      <td>{plan.invoice_amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No plans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanFinder;
