"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  value?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  inputId?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search problems, topics, or algorithms...",
  value,
  inputRef,
  inputId,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = typeof value === "string";
  const searchQuery = isControlled ? value : internalValue;

  const handleSearch = (value: string) => {
    if (!isControlled) {
      setInternalValue(value);
    }
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-zinc-400 dark:text-zinc-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}
