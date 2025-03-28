'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder: string;
}

export default function SearchBar({ placeholder }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results page with the search term as a query parameter
      router.push(`/search/results?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:outline-none"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
      >
        Search
      </button>
    </form>
  );
} 