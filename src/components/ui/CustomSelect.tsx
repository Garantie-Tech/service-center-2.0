"use client";

import { useState } from "react";

interface CustomSelectProps {
  options: string[];
  placeholder?: string; // Default disabled option
  onChange: (value: string) => void;
  className?: string;
  fontSize?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder = "Select",
  onChange,
  className = "",
  fontSize = "text-xs",
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full`}>
      {/* Select Box */}
      <button
        className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none ${className} ${fontSize}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption || placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul className={`absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10 ${fontSize}`}>
          {/* Disabled Placeholder Option */}
          <li className={`px-4 py-2 text-gray-400 cursor-not-allowed`}>
            {placeholder}
          </li>

          {/* Dynamic Options */}
          {options.map((option) => (
            <li
              key={option}
              className={`px-4 py-2 hover:bg-[#EDEDED] cursor-pointer`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
