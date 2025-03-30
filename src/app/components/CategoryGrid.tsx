'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  image: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const router = useRouter();
  
  // Log the categories being rendered to debug
  console.log('Rendering categories:', JSON.stringify(categories));

  // Check for duplicate IDs
  const categoryIds = categories.map(cat => cat.id);
  const hasDuplicateIds = categoryIds.length !== new Set(categoryIds).size;
  if (hasDuplicateIds) {
    console.warn('WARNING: Duplicate category IDs detected:', 
      categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index));
  }

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    router.push(`/search/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };
  
  // Icons for categories (add more if needed)
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('spice')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 3v12a6 6 0 0 0 12 0V3" />
      </svg>
    );
    
    if (name.includes('herb')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
    
    if (name.includes('ice') || name.includes('cream')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    );
    
    if (name.includes('vegetable')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 9.5H3M21 4.5H3M21 14.5H3M21 19.5H3" />
      </svg>
    );
    
    if (name.includes('fruit')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03l-3-3m0 0l3-3m-3 3h10.125" />
      </svg>
    );
    
    if (name.includes('dairy')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
      </svg>
    );
    
    // Default icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {categories.map((category, index) => (
        <div
          key={`cat-${category.id}-${category.name}-${index}`}
          onClick={() => handleCategoryClick(category.id, category.name)}
          className="group cursor-pointer"
        >
          <div className="aspect-square flex flex-col items-center justify-center border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors group-hover:bg-gray-800 group-hover:text-white">
              {getCategoryIcon(category.name)}
            </div>
            <h3 className="text-center text-base font-medium text-gray-800 group-hover:text-gray-900 md:text-lg">{category.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
} 