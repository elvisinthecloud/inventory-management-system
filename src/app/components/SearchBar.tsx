'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useLoading } from '../context/LoadingContext';

interface SearchBarProps {
  placeholder: string;
}

// Add product interface
interface Product {
  name: string;
  [key: string]: string | number | boolean; // More specific type instead of any
}

export default function SearchBar({ placeholder }: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { startLoading } = useLoading();
  
  // Initialize search term from URL query parameter
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update input field when URL query changes (e.g., when navigating)
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  // Get product suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      // Get products from localStorage
      try {
        const productsJson = localStorage.getItem('products');
        if (productsJson) {
          const products = JSON.parse(productsJson) as Product[];
          // Filter products based on search term
          const filteredProducts = products
            .filter((product: Product) => 
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 5); // Limit to 5 suggestions
          
          setSuggestions(filteredProducts.map((p: Product) => p.name));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error getting product suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

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
    setShowSuggestions(false);
    
    // If not on the results page, navigate to it with loading indicator
    if (!pathname.includes('/search/results')) {
      startLoading();
      replace(`/search/results?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
    setShowSuggestions(false);
    
    // Show loading indicator when navigating to search results
    if (!pathname.includes('/search/results')) {
      startLoading();
      replace(`/search/results?q=${encodeURIComponent(suggestion)}`);
    }
  };

  // Handle blur event
  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="absolute inset-y-0 left-0 flex items-center pl-5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const newTerm = e.target.value;
            setSearchTerm(newTerm);
            handleSearch(newTerm);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full border border-gray-300 bg-white py-4 pl-14 pr-16 text-base text-black shadow-md outline-none transition focus:border-gray-500 focus:shadow-lg"
        />
        
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-4 font-medium text-gray-700 hover:text-gray-900"
        >
          <span className="hidden sm:inline mr-1">Search</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={`${suggestion}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="cursor-pointer px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 