import React from "react";
import Image from "next/image";

interface HeaderProps {
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  return (
    <header className="flex items-center justify-between bg-primaryBlue px-4 py-2 text-white shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <Image
          src="/images/v-shield.svg" // Replace with your logo URL
          alt="V-Shield Logo"
          width={120}
          height={64}
        />
        <button onClick={onRefresh} className="">
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
        Welcome Ahmedabad Service Center
      </h1>

      {/* Profile Section */}
      <div className="flex items-center gap-2">
        <Image
          src="/images/user-icon.svg"
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
        <div>
          <p className="text-sm font-bold">Moni Roy</p>
          <p className="text-xs">Admin</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
