import React from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import CategoryGrid from '@/app/components/CategoryGrid';

const geistSans = Geist({
  weight: '400',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function SearchPage() {
  // Sample categories data - in a real app, this would come from a database
  const categories = [
    { id: 1, name: 'Spices', image: '/images/categories/spices.jpg' },
    { id: 2, name: 'Herbs', image: '/images/categories/herbs.jpg' },
    { id: 3, name: 'Ice Cream', image: '/images/categories/icecream.jpg' },
    { id: 4, name: 'Vegetables', image: '/images/categories/vegetables.jpg' },
    { id: 5, name: 'Fruits', image: '/images/categories/fruits.jpg' },
    { id: 6, name: 'Dairy', image: '/images/categories/dairy.jpg' },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* Search Bar - made wider */}
      <div className="mx-auto max-w-4xl mb-12">
        <SearchBar placeholder="Search for products..." />
      </div>
      
      {/* Categories Section */}
      <div className="mt-4">
        <h2 className={`${robotoMono.className} mb-8 border-b-4 border-blue-500 pb-2 text-3xl uppercase tracking-wider text-gray-800`}>
          CATEGORIES
        </h2>
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
} 