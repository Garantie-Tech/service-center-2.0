"use client";

import Header from "@/components/Header";
import { useNotification } from "@/context/NotificationProvider";
import { formatDate } from "@/helpers/dateHelper";
import { ServiceCenterProfile } from "@/interfaces/GlobalInterface";
import { resetPassword } from "@/services/authService";
import { getServiceCenterProfileData } from "@/services/claimService";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfileDetails = () => {
  const [profile, setProfile] = useState<ServiceCenterProfile | null>(null);
  const { setIsLoading, setFilterState, setSelectedDropdown } =
    useGlobalStore();
  const router = useRouter();
  const [showResetPasswordSection, setShowResetPasswordSection] =
    useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [formError, setFormError] = useState("");

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    setFilterState("");
    setSelectedDropdown("All Claims");
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
        console.error("Failed to fetch profile data:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    getProfileData();
  }, []);

  const handleInputChange = (
    field: keyof typeof passwordFields,
    value: string
  ) => {
    setPasswordFields((prev) => ({ ...prev, [field]: value }));
    setFormError("");
  };

  const handleSubmit = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordFields;

    if (!currentPassword) {
      setFormError("Current password is required.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setFormError("All fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError("New password and confirm password do not match.");
      return;
    }

    const credentials = {
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmNewPassword,
    };

    try {
      setIsLoading(true);
      const response = await resetPassword(credentials);
      console.log(response);
      if (response?.success == false) {
        notifyError(response?.message);
      }

      if (response?.success) {
        notifySuccess("Password Reset Successfully !");
        setShowResetPasswordSection(false);
        handleLogout();
      }
    } catch (error) {
      if (error instanceof Error) {
        notifyError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-8">
      <Header onLogout={handleLogout} />
      <div>
        <div className="border-b px-[50px] py-[30px] flex items-center items-start gap-3">
          <Image
            src="/images/chevron-down.svg"
            alt="chevron"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={() => router.push("/dashboard")}
          />
          <h2 className="text-xl font-semibold text-black">Profile</h2>
        </div>

        <div className="w-[96%] mx-[50px] my-[30px]">
          {/* Service Centre Details */}
          <h3 className="text-lg font-semibold mb-4 text-black">
            Service Centre Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#757575]">Name</p>
                <p className="text-sm font-semibold text-blackContent">
                  {profile?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#757575]">Mobile</p>
                <p className="text-sm font-semibold text-blackContent">
                  {profile?.mobile}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-9 md:pt-0">
              <div>
                <p className="text-xs text-[#757575]">Email</p>
                <p className="text-sm font-semibold text-blackContent">
                  {profile?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#757575]">Address</p>
                <p className="text-sm font-semibold text-blackContent">
                  {`${profile?.address?.address_line_1}, ${profile?.city}, ${profile?.state}, ${profile?.pincode}`}
                </p>
              </div>
            </div>
          </div>

          {/* User Account Details */}
          <h3 className="text-lg font-semibold mb-4 text-black">
            User Account Details
          </h3>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
              showResetPasswordSection ? "border-b pb-8" : ""
            }`}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#757575]">Mobile</p>
                <p className="text-sm font-semibold text-blackContent">
                  {profile?.user?.[0]?.mobile}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-[#757575]">Password</p>
                  <p className="text-sm font-semibold text-blackContent">
                    ***********
                  </p>
                </div>
                {profile?.user?.[0]?.type !== "service_head" &&
                  (showResetPasswordSection ? (
                    <button
                      className="text-xs text-blue-600 font-medium hover:underline"
                      onClick={() => setShowResetPasswordSection(false)}
                    >
                      Hide
                    </button>
                  ) : (
                    <button
                      className="text-xs text-blue-600 font-medium hover:underline"
                      onClick={() => setShowResetPasswordSection(true)}
                    >
                      Reset Password
                    </button>
                  ))}
              </div>
              <div>
                <p className="text-xs text-[#757575]">Active</p>
                <p className="text-sm font-semibold text-blackContent">
                  {profile?.user?.[0]?.is_active ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-9 md:pt-0">
              <div>
                <p className="text-xs text-[#757575]">Email</p>
                <p className="text-sm font-semibold text-blackContent">
                  {profile?.user?.[0]?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#757575]">Creation Date</p>
                <p className="text-sm font-semibold text-blackContent">
                  {formatDate(String(profile?.user?.[0]?.created_at))}
                </p>
              </div>
            </div>
          </div>

          {/* Password Reset Form */}
          {showResetPasswordSection && (
            <div className="pt-8 w-1/4">
              <h3 className="text-lg font-semibold mb-4 text-black">
                Reset Password
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">
                  Current Password
                </label>
                <input
                  type="text"
                  value={passwordFields.currentPassword}
                  onChange={(e) =>
                    handleInputChange("currentPassword", e.target.value)
                  }
                  className="input input-bordered text-sm w-full bg-inputBg"
                  placeholder="Enter Current Password"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  value={passwordFields.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  className="input input-bordered text-sm w-full bg-inputBg"
                  placeholder="Enter New Password"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="text"
                  value={passwordFields.confirmNewPassword}
                  onChange={(e) =>
                    handleInputChange("confirmNewPassword", e.target.value)
                  }
                  className="input input-bordered text-sm w-full bg-inputBg"
                  placeholder="Confirm New Password"
                />
              </div>

              {formError && (
                <p className="text-[#f00] text-xs mb-4">{formError}</p>
              )}

              <button
                className={`btn w-1/2 bg-primaryBlue text-white hover:bg-blue-700`}
                onClick={handleSubmit}
              >
                Reset Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
