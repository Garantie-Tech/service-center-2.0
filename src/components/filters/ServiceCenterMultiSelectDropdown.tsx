"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalStore } from "@/store/store";
import { useAuthStore } from "@/store/authStore";
import {
  fetchServiceHeadServiceCentres,
  ServiceCentreOption,
} from "@/services/claimService";
import { isServiceHeadUserType } from "@/helpers/globalHelper";

const ServiceCenterMultiSelectDropdown: React.FC = () => {
  const filterState = useGlobalStore((s) => s.filterState);
  const filterServiceCentre = useGlobalStore((s) => s.filterServiceCentre);
  const setFilterServiceCentre = useGlobalStore((s) => s.setFilterServiceCentre);
  const stateOptions = useGlobalStore((s) => s.stateOptions);
  const isLoading = useGlobalStore((s) => s.isLoading);
  const userType = useAuthStore((s) => s.user.user_type);

  const [open, setOpen] = useState(false);
  const [serviceCentres, setServiceCentres] = useState<ServiceCentreOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = filterServiceCentre.split(",").filter(Boolean);
  const selectedKey = selected.join(",");
  const selectedStateIds = useMemo(() => {
    const ids = filterState.split(",").filter(Boolean);
    if (ids.length > 0) {
      return ids;
    }

    return Object.keys(stateOptions ?? {});
  }, [filterState, stateOptions]);
  const selectedStateIdsKey = selectedStateIds.join(",");

  useEffect(() => {
    const loadServiceCentres = async () => {
      const requestedStateIds = selectedStateIdsKey
        .split(",")
        .filter(Boolean);

      if (!isServiceHeadUserType(userType) || requestedStateIds.length === 0) {
        setServiceCentres([]);
        return;
      }

      try {
        const response = await fetchServiceHeadServiceCentres(requestedStateIds);
        setServiceCentres(response?.data?.data ?? []);
      } catch (error) {
        console.error("Failed to load service centres:", error);
        setServiceCentres([]);
      }
    };

    loadServiceCentres();
  }, [selectedStateIdsKey, userType]);

  useEffect(() => {
    const currentSelections = selectedKey.split(",").filter(Boolean);

    if (currentSelections.length === 0) {
      return;
    }

    const validSelections = currentSelections.filter((id) =>
      serviceCentres.some((option) => String(option.value) === id),
    );

    if (validSelections.join(",") !== selectedKey) {
      setFilterServiceCentre(validSelections.join(","));
    }
  }, [selectedKey, serviceCentres, setFilterServiceCentre]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleItem = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((value) => value !== id)
      : [...selected, id];

    setFilterServiceCentre(updated.join(","));
  };

  const clearAll = () => {
    setFilterServiceCentre("");
  };

  if (!isServiceHeadUserType(userType)) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`input input-bordered w-full text-sm flex justify-between items-center ${
          isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        onClick={() => {
          if (!isLoading && selectedStateIds.length > 0) setOpen(!open);
        }}
      >
        <span className="truncate w-[75%]">
          {selected.length > 0
            ? serviceCentres
                .filter((centre) => selected.includes(String(centre.value)))
                .map((centre) => centre.title)
                .join(", ")
            : "Select Service Centres"}
        </span>
        <div className="flex justify-end items-center w-[25%]">
          {selected.length > 0 ? (
            <button
              className="absolute mr-[25px] text-gray-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
                setOpen(false);
              }}
              title="Clear selection"
            >
              ✕
            </button>
          ) : null}

          <svg
            className={`w-4 h-4 transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {open && selectedStateIds.length > 0 && (
        <ul className="border mt-1 bg-white rounded-md shadow text-sm max-h-[400px] overflow-auto absolute z-50 w-full">
          {serviceCentres.length > 0 ? (
            serviceCentres.map(({ value, title }) => (
              <li
                key={value}
                onClick={() => {
                  if (!isLoading) toggleItem(String(value));
                }}
                className={`px-4 py-2 cursor-pointer flex justify-between transition-colors duration-150 ${
                  selected.includes(String(value))
                    ? "bg-primaryBlue text-white hover:bg-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <span>{title}</span>
                {selected.includes(String(value)) && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500">No service centres found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ServiceCenterMultiSelectDropdown;
