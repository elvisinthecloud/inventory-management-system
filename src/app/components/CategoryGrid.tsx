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

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    router.push(`/search/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105"
          onClick={() => handleCategoryClick(category.id, category.name)}
        >
          <div className="relative h-32 w-full">
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <span className="text-lg font-bold text-gray-700">{category.name}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-center font-medium">{category.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
} 