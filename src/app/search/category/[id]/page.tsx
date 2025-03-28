import React from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';

const geistSans = Geist({
  weight: '400',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// Mock product data - in a real app, this would come from a database
const allProducts = [
  { id: 1, name: 'Cinnamon', category: 'Spices', categoryId: 1, price: 3.99 },
  { id: 2, name: 'Cardamom', category: 'Spices', categoryId: 1, price: 5.99 },
  { id: 3, name: 'Turmeric', category: 'Spices', categoryId: 1, price: 2.99 },
  { id: 4, name: 'Basil', category: 'Herbs', categoryId: 2, price: 2.49 },
  { id: 5, name: 'Mint', category: 'Herbs', categoryId: 2, price: 1.99 },
  { id: 6, name: 'Rosemary', category: 'Herbs', categoryId: 2, price: 2.29 },
  { id: 7, name: 'Vanilla Ice Cream', category: 'Ice Cream', categoryId: 3, price: 4.99 },
  { id: 8, name: 'Chocolate Ice Cream', category: 'Ice Cream', categoryId: 3, price: 4.99 },
  { id: 9, name: 'Strawberry Ice Cream', category: 'Ice Cream', categoryId: 3, price: 5.49 },
  { id: 10, name: 'Tomatoes', category: 'Vegetables', categoryId: 4, price: 2.99 },
  { id: 11, name: 'Carrots', category: 'Vegetables', categoryId: 4, price: 1.49 },
  { id: 12, name: 'Broccoli', category: 'Vegetables', categoryId: 4, price: 1.99 },
  { id: 13, name: 'Apples', category: 'Fruits', categoryId: 5, price: 3.49 },
  { id: 14, name: 'Bananas', category: 'Fruits', categoryId: 5, price: 1.29 },
  { id: 15, name: 'Oranges', category: 'Fruits', categoryId: 5, price: 2.49 },
  { id: 16, name: 'Milk', category: 'Dairy', categoryId: 6, price: 2.49 },
  { id: 17, name: 'Cheese', category: 'Dairy', categoryId: 6, price: 3.99 },
  { id: 18, name: 'Yogurt', category: 'Dairy', categoryId: 6, price: 1.99 },
];

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { name?: string }
}) {
  const categoryId = parseInt(params.id);
  const categoryName = searchParams?.name || 'Category';
  
  // Filter products by category ID
  const categoryProducts = allProducts.filter(
    product => product.categoryId === categoryId
  );
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-8 flex items-center">
        <Link href="/search" className="mr-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span className="text-xl">←</span> <span className="ml-1">Back</span>
        </Link>
        <h1 className={`${robotoMono.className} border-b-4 border-blue-500 pb-2 text-3xl uppercase tracking-wider text-gray-800`}>
          {categoryName.toUpperCase()}
        </h1>
      </div>
      
      {/* Search Bar */}
      <div className="mx-auto max-w-4xl mb-8">
        <SearchBar placeholder={`Search in ${categoryName}...`} />
      </div>
      
      {/* Products Grid */}
      <div className="mt-8">
        <h2 className={`${geistSans.className} mb-6 text-2xl font-semibold text-gray-800`}>
          {categoryProducts.length} Products Available
        </h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {categoryProducts.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-gray-600">No products found in this category</p>
            <Link href="/search" className="mt-6 inline-block rounded-md bg-blue-500 px-5 py-2 text-white hover:bg-blue-600">
              Back to all categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 