"use client";

import { ServiceCentreOption } from "@/services/claimService";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";

interface SearchableServiceCentreDropdownProps {
  options: ServiceCentreOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

const optionLabel = (option: ServiceCentreOption) => {
  const location = [option.city, option.state].filter(Boolean).join(", ");
  return location ? `${option.title} — ${location}` : option.title;
};

const searchableText = (option: ServiceCentreOption) =>
  [option.title, option.city, option.state, option.pincode]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

const SearchableServiceCentreDropdown: React.FC<
  SearchableServiceCentreDropdownProps
> = ({
  options,
  selectedValues,
  onChange,
  multiple = false,
  label,
  placeholder = "Select Service Centre",
  disabled = false,
  loading = false,
  emptyMessage = "No Service Centres found",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selectedSet = useMemo(
    () => new Set(selectedValues),
    [selectedValues],
  );

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();

    if (!query) return options;

    return options.filter((option) => searchableText(option).includes(query));
  }, [options, searchTerm]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(String(option.value))),
    [options, selectedSet],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    searchInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex((current) =>
      filteredOptions.length === 0
        ? 0
        : Math.min(current, filteredOptions.length - 1),
    );
  }, [filteredOptions.length]);

  const openDropdown = () => {
    if (disabled || loading) return;

    setIsOpen((current) => !current);
    setSearchTerm("");
    setHighlightedIndex(0);
  };

  const selectOption = (option: ServiceCentreOption) => {
    const value = String(option.value);

    if (multiple) {
      onChange(
        selectedSet.has(value)
          ? selectedValues.filter((selectedValue) => selectedValue !== value)
          : [...selectedValues, value],
      );
      return;
    }

    onChange([value]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange([]);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        filteredOptions.length === 0
          ? 0
          : (current + 1) % filteredOptions.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        filteredOptions.length === 0
          ? 0
          : (current - 1 + filteredOptions.length) % filteredOptions.length,
      );
      return;
    }

    if (event.key === "Enter" && filteredOptions[highlightedIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[highlightedIndex]);
    }
  };

  const triggerLabel = loading
    ? "Loading Service Centres..."
    : selectedOptions.length === 0
      ? placeholder
      : multiple && selectedOptions.length > 1
        ? `${selectedOptions[0].title} +${selectedOptions.length - 1} more`
        : optionLabel(selectedOptions[0]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-black">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={openDropdown}
          className={`input input-bordered flex min-h-12 w-full items-center justify-between gap-3 bg-white pr-16 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primaryBlue/30 ${
            disabled || loading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-primaryBlue"
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
        >
          <span className="min-w-0 truncate text-black">{triggerLabel}</span>

          <svg
            className={`h-4 w-4 text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {selectedOptions.length > 0 && !disabled && !loading && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded px-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Clear Service Centre selection"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id={listboxId}
          className="absolute z-50 mt-2 w-full min-w-[280px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
          role="listbox"
          aria-multiselectable={multiple || undefined}
        >
          <div className="border-b border-gray-100 bg-white p-2">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-4-4" />
              </svg>
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by name, city, state or pincode"
                className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-black outline-none transition focus:border-primaryBlue focus:ring-2 focus:ring-primaryBlue/20"
                aria-label="Search Service Centres"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-gray-500">
                {searchTerm ? "No Service Centres match your search" : emptyMessage}
              </p>
            ) : (
              filteredOptions.map((option, index) => {
                const value = String(option.value);
                const isSelected = selectedSet.has(value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectOption(option)}
                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                      isHighlighted ? "bg-blue-50" : "hover:bg-gray-50"
                    } ${isSelected ? "font-medium text-primaryBlue" : "text-gray-800"}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{option.title}</span>
                      <span className="block truncate text-xs text-gray-500">
                        {[option.city, option.state, option.pincode]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    {isSelected && (
                      <svg
                        className="h-4 w-4 shrink-0 text-primaryBlue"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {multiple && filteredOptions.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
              {selectedOptions.length} selected · {filteredOptions.length} shown
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableServiceCentreDropdown;
