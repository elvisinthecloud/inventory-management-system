import React from 'react';
import { Geist } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import CategoryGrid from '@/app/components/CategoryGrid';

const geistSans = Geist({
  weight: '400',
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
    <div className="container mx-auto px-4 py-6">
      <h1 className={`${geistSans.className} text-2xl font-bold mb-6`}>Search Products</h1>
      
      {/* Search Bar */}
      <SearchBar placeholder="Search for products..." />
      
      {/* Categories Section */}
      <div className="mt-8">
        <h2 className={`${geistSans.className} text-xl font-semibold mb-4`}>Categories</h2>
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
} 