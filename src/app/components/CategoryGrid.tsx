'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '../context/LoadingContext';

interface Category {
  id: number;
  name: string;
  image: string; // Image property might be used in the future
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const router = useRouter();
  const { startLoading } = useLoading();
  
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
    // Start loading before navigation
    startLoading();
    router.push(`/search/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };
  
  // Simplified icon logic - using Material Icons based on name
  const getCategoryIconName = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('spice') || name.includes('especia')) return 'local_bar';
    if (name.includes('herb') || name.includes('hierba')) return 'eco';
    if (name.includes('ice') || name.includes('cream')) return 'ac_unit';
    if (name.includes('vegetable')) return 'local_florist';
    if (name.includes('fruit')) return 'apple';
    if (name.includes('dairy')) return 'egg';
    if (name.includes('chile')) return 'local_fire_department'; 
    return 'category'; // Default icon
  };

  return (
    // Use a standard responsive grid layout
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {categories.map((category) => (
        // Category Card
        <button
          key={`cat-${category.id}`}
          onClick={() => handleCategoryClick(category.id, category.name)}
          className="group flex flex-col items-center justify-center p-4 md:p-6 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:border-blue-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ minHeight: '140px' }} // Ensure cards have a consistent minimum height
        >
          {/* Icon */}
          <div className="mb-3 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 transition-colors duration-300 group-hover:from-blue-500 group-hover:to-blue-700 group-hover:text-white">
            <span className="material-icons text-2xl md:text-3xl">
              {getCategoryIconName(category.name)}
            </span>
          </div>
          {/* Category Name */}
          <h3 className="text-center text-sm md:text-base font-semibold text-gray-700 transition-colors duration-300 group-hover:text-blue-600">
            {category.name}
          </h3>
        </button>
      ))}
    </div>
  );
} 