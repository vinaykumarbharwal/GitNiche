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
<<<<<<< HEAD
      <div className="flex flex-col gap-3 rounded-md border border-[#30363d] bg-[#161b22] p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8b949e]">
=======
      <div className="flex flex-col gap-3 rounded-md border border-border-color bg-bg-card p-3 shadow-sm sm:flex-row sm:items-center transition duration-200">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
>>>>>>> a1ea59ddba13503b89a0d3877394e0da728a17a0
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
<<<<<<< HEAD
            placeholder="Search repositories, issues, or topics"
            className="block h-10 w-full rounded-md border border-[#30363d] bg-[#0d1117] pl-9 pr-3 text-sm text-[#f0f6fc] outline-none placeholder:text-[#8b949e] focus:border-[#1f6feb] focus:bg-[#0d1117] focus:ring-2 focus:ring-[#1f6feb]/30"
=======
            placeholder="Search Python, AI, React, DevOps (names, languages, domains, topics, descriptions)..."
            className="block h-10 w-full rounded-md border border-border-color bg-bg-btn pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-[#0969da] focus:bg-bg-card focus:ring-2 focus:ring-[#0969da]/20 transition duration-200"
>>>>>>> a1ea59ddba13503b89a0d3877394e0da728a17a0
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-md bg-[#2da44e] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#2c974b] focus:outline-none focus:ring-2 focus:ring-[#2da44e]/30 cursor-pointer"
        >
          Find projects
        </button>
      </div>
    </form>
  );
}
