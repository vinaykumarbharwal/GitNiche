"use client";

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 rounded-md border border-[#d0d7de] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#57606a]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search repositories, issues, or topics"
            className="block h-10 w-full rounded-md border border-[#d0d7de] bg-[#f6f8fa] pl-9 pr-3 text-sm text-[#24292f] outline-none placeholder:text-[#6e7781] focus:border-[#0969da] focus:bg-white focus:ring-2 focus:ring-[#0969da]/20"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-md bg-[#2da44e] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#2c974b] focus:outline-none focus:ring-2 focus:ring-[#2da44e]/30"
        >
          Find projects
        </button>
      </div>
    </form>
  );
}