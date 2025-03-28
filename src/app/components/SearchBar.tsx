'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface SearchBarProps {
  placeholder: string;
}

export default function SearchBar({ placeholder }: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Initialize search term from URL query parameter
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  // Update input field when URL query changes (e.g., when navigating)
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  // Debounced search to avoid too many URL updates
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching for: ${term}`);
    
    const params = new URLSearchParams(searchParams);
    
    // Reset to page 1 on new search
    params.set('page', '1');
    
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    
    // Update URL with the search parameters
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
    
    // If not on the results page, navigate to it
    if (!pathname.includes('/search/results')) {
      replace(`/search/results?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex w-full items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const newTerm = e.target.value;
            setSearchTerm(newTerm);
            handleSearch(newTerm);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </form>
  );
} 