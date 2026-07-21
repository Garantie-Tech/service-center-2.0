import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "@/components/icons/Icons";
import { useAuthStore } from "@/store/authStore";
import { hasNoidaShipmentAccess } from "@/helpers/globalHelper";

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const serviceCenterName = useAuthStore((state) => state.user);
  const hasShipmentAccess = hasNoidaShipmentAccess(serviceCenterName);
  const pathname = usePathname();

  return (
    <header className="bg-primaryBlue px-4 py-2 text-white shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/v-shield.svg"
            alt="V-Shield Logo"
            width={120}
            height={64}
          />
        </div>

        {/* Title Section */}
        <h1 className="hidden md:block text-xl font-bold text-center flex-1">
          Welcome {serviceCenterName?.name}
        </h1>

        {/* Profile Section */}
        <div
          className="dropdown dropdown-bottom dropdown-end text-gray-600 tooltip tooltip-bottom"
          data-tip="Profile"
        >
          <div tabIndex={0} role="button" className="flex items-center gap-2">
            <Image
              src="/images/user-icon.svg"
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
            <Image
              src="/images/dropdown-icon.svg"
              alt="Dropdown"
              width={20}
              height={20}
            />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-xs"
          >
            {pathname === "/dashboard" && (
              <>
                {hasShipmentAccess && (
                  <li>
                    <Link
                      href="/noida-shipment"
                      className="flex items-center gap-2"
                    >
                      <Image
                        src="/images/all-claims-icon.svg"
                        alt="Shipment"
                        width={20}
                        height={20}
                      />
                      Noida Shipment
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/profile" className="flex items-center gap-2">
                    <Image
                      src="/images/user-profile-icon.svg"
                      alt="Profile"
                      width={20}
                      height={20}
                    />
                    Profile
                  </Link>
                </li>
              </>
            )}
            {pathname !== "/dashboard" && pathname !== "/noida-shipment" && (
              <li>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-[20px] h-[20px]">
                    <HomeIcon />
                  </div>
                  Home
                </Link>
              </li>
            )}

            {pathname === "/noida-shipment" && (
              <li>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-[20px] h-[20px]">
                    <HomeIcon />
                  </div>
                  Home
                </Link>
              </li>
            )}

            {/* <li>
              <Link href="/settings" className="flex items-center gap-2">
                <Image
                  src="/images/settings-icon.svg"
                  alt="Settings"
                  width={20}
                  height={20}
                />
                Settings
              </Link>
            </li> */}
            <li>
              <button onClick={onLogout} className="flex items-center gap-2">
                <Image
                  src="/images/logout-icon.svg"
                  alt="Logout"
                  width={20}
                  height={20}
                />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      <h1 className="md:hidden block text-xl font-bold text-center flex-1">
        Welcome {serviceCenterName?.name}
      </h1>
    </header>
  );
};

export default Header;
