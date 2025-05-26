"use client";

// import useInitializeStates from "@/hooks/useInitializeStates";
import { useGlobalStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";

const StateMultiSelectDropdown: React.FC = () => {
  const filterState = useGlobalStore((s) => s.filterState);
  const setFilterState = useGlobalStore((s) => s.setFilterState);
  const isLoading = useGlobalStore((s) => s.isLoading);
  const selected = filterState.split(",").filter(Boolean);
  const getStateDropdownList = useGlobalStore((s) => s.getStateDropdownList);
  // useInitializeStates();
  const stateList = getStateDropdownList();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleItem = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];

    setFilterState(updated.join(","));
  };

  const clearAll = () => {
    setFilterState("");
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* <h3 className="text-sm font-bold mb-2">State Filter</h3> */}
      <div
        className={`input input-bordered w-full text-sm flex justify-between items-center ${
          isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        onClick={() => {
          if (!isLoading) setOpen(!open);
        }}
      >
        <span className="truncate w-[75%]">
          {selected.length > 0
            ? stateList
                .filter((s) => selected.includes(s.id))
                .map((s) => s.name)
                .join(", ")
            : "Select States"}
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

      {open && (
        <ul className="border mt-1 bg-white rounded-md shadow text-sm max-h-[400px] overflow-auto absolute z-50 w-full">
          {stateList.map(({ id, name }) => (
            <li
              key={id}
              onClick={() => {
                if (!isLoading) toggleItem(id);
              }}
              className={`px-4 py-2 cursor-pointer flex justify-between transition-colors duration-150 ${
                selected.includes(id)
                  ? "bg-primaryBlue text-white hover:bg-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <span>{name}</span>
              {selected.includes(id) && (
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
          ))}
        </ul>
      )}
    </div>
  );
};

export default StateMultiSelectDropdown;
