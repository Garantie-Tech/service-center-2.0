"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "@/components/icons/Icons";
import { useClaimNotifications } from "@/context/ClaimNotificationProvider";

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const user = localStorage.getItem("user");
  const serviceCenterName = user ? JSON.parse(user) : null;
  const pathname = usePathname();
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const {
    notifications,
    unreadCount,
    isOpen: isNotificationOpen,
    toggleInbox,
    closeInbox,
    openNotification,
  } = useClaimNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        closeInbox();
      }
    }

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen, closeInbox]);

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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationMenuRef}>
            <button
              type="button"
              onClick={toggleInbox}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/20 transition"
              aria-label="Notifications"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .538-.214 1.055-.595 1.435L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-[360px] max-w-[90vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-50">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Inbox</p>
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={closeInbox}
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => void openNotification(notification.id)}
                        className={`w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                          notification.is_read ? "" : "bg-blue-50/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              Claim #{notification.claim_id}
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {notification.message}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                              notification.is_read
                                ? "bg-gray-100 text-gray-600"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {notification.type_label}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
              )}
              {pathname != "/dashboard" && (
                <li>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-[20px] h-[20px]">
                      <HomeIcon />
                    </div>
                    Home
                  </Link>
                </li>
              )}

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
      </div>
      <h1 className="md:hidden block text-xl font-bold text-center flex-1">
        Welcome {serviceCenterName?.name}
      </h1>
    </header>
  );
};

export default Header;
