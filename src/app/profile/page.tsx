"use client";

import Header from "@/components/Header";
import { formatDate } from "@/helpers/dateHelper";
import { ServiceCenterProfile } from "@/interfaces/GlobalInterface";
import { getServiceCenterProfileData } from "@/services/claimService";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfileDetails = () => {
  const [profile, setProfile] = useState<ServiceCenterProfile | null>(null);
  const { setIsLoading } = useGlobalStore();
  const router = useRouter();

  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    const getProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await getServiceCenterProfileData();
        if (response.success && response?.data?.data) {
          setProfile(response?.data?.data ?? null);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    getProfileData();
  }, []);

  return (
    <div>
      <Header onLogout={handleLogout} />
      <div>
        {/* Profile Heading */}
        <div className="border-b px-[50px] py-[30px] flex items-center items-start gap-3">
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
          <h2 className="text-xl font-semibold text-black">Profile</h2>
        </div>

        <div className="w-[96%] mx-[50px] my-[30px]">
          {/* Service Centre Details */}
          <h3 className="text-lg font-semibold mb-4 text-black">
            Service Centre Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8 mb-8">
            <div>
              <div className="space-y-4">
                <div>
                  <p className="font-[400] text-xs text-[#757575] ">Name</p>
                  <p className="text-blackContent text-sm font-semibold">
                    {profile?.name}
                  </p>
                </div>
                <div>
                  <p className="font-[400] text-xs text-[#757575]">Mobile</p>
                  <p className="text-blackContent font-semibold text-sm">
                    {profile?.mobile}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-4 pt-9 md:pt-0">
                <div>
                  <p className="font-[400] text-xs text-[#757575]">Email</p>
                  <p className="text-blackContent font-semibold text-sm">
                    {profile?.email}
                  </p>
                </div>
                <div>
                  <p className="font-[400] text-xs text-[#757575]">Address</p>
                  <p className="text-blackContent font-semibold text-sm">
                    {`${profile?.address?.address_line_1}, ${profile?.city}, ${profile?.state}, ${profile?.pincode}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Account Details */}
          <h3 className="text-lg font-semibold mb-4 text-black">
            User Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                <div>
                  <p className="font-[400] text-xs text-[#757575]">Mobile</p>
                  <p className="text-blackContent font-semibold text-sm">
                    {profile?.user?.[0]?.mobile}
                  </p>
                </div>
                <div className="flex items-center gap-4 align-center">
                  <div>
                    <p className="font-[400] text-xs text-[#757575]">
                      Password
                    </p>
                    <p className="text-blackContent font-semibold text-sm">
                      ***********
                    </p>
                  </div>
                  {/* <button className="text-xs text-blue-600 font-medium hover:underline">
                    Reset Password
                  </button> */}
                </div>
                <div>
                  <p className="font-[400] text-xs text-[#757575]">Active</p>
                  <p className="text-blackContent font-semibold text-sm">
                    {profile?.user?.[0]?.is_active ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-9 md:pt-0">
              <div>
                <p className="font-[400] text-xs text-[#757575]">Email</p>
                <p className="text-blackContent font-semibold text-sm">
                  {profile?.user?.[0]?.email}
                </p>
              </div>
              <div>
                <p className="font-[400] text-xs text-[#757575]">
                  Creation Date
                </p>
                <p className="text-blackContent font-semibold text-sm">
                  {formatDate(String(profile?.user?.[0]?.created_at))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
