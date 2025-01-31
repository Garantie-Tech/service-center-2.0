import React from "react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, onLogout }) => {
  const user = localStorage.getItem('user');
  const serviceCenterName = user ? JSON.parse(user) : null;

  return (
    <header className="flex items-center justify-between bg-primaryBlue px-4 py-2 text-white shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <Image
          src="/images/v-shield.svg"
          alt="V-Shield Logo"
          width={120}
          height={64}
        />
        <button onClick={onRefresh}>
          <Image
            src="/images/refresh.svg"
            alt="Refresh"
            width={20}
            height={20}
          />  
        </button>
      </div>

      {/* Title Section */}
      <h1 className="text-xl font-bold text-center flex-1">
        Welcome {serviceCenterName?.name}
      </h1>

      {/* Profile Section */}
      <div className="dropdown dropdown-bottom dropdown-end text-gray-600">
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
          <li>
            <Link href="/settings" className="flex items-center gap-2">
              <Image
                src="/images/settings-icon.svg"
                alt="Settings"
                width={20}
                height={20}
              />
              Settings
            </Link>
          </li>
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
    </header>
  );
};

export default Header;
