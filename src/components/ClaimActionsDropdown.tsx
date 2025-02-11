"use client";

import { useState } from "react";
import Image from "next/image";

const ClaimActionsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative text-xs text-gray-600">
      {/* Three dots button */}

      <button title="More Options" onClick={toggleDropdown}>
        <Image
          src="/images/three-dots.svg"
          alt="More Options"
          width={24}
          height={5}
          className="cursor-pointer"
          style={{ height: "20px" }}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50">
          <ul className="py-4">
            <li
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => alert("Time Line Clicked")}
            >
              <Image
                src="/images/calender-dark.svg"
                alt="Timeline"
                width={20}
                height={20}
                className="mr-2"
              />
              Time Line
            </li>
            <li
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => alert("Revise Estimate Clicked")}
            >
              <Image
                src="/images/reload-dark.svg"
                alt="Revise"
                width={20}
                height={20}
                className="mr-2"
              />
              Revise Estimate
            </li>
            <li
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => alert("Cancel Claim Clicked")}
            >
              <Image
                src="/images/cross-dark.svg"
                alt="Cancel"
                width={20}
                height={20}
                className="mr-2"
              />
              Cancel Claim
            </li>
            <li
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => alert("Additional Info Clicked")}
            >
              <Image
                src="/images/calender-dark.svg"
                alt="Info"
                width={20}
                height={20}
                className="mr-2"
              />
              Additional Info
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClaimActionsDropdown;
