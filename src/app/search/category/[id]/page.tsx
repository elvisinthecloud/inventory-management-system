import React from 'react';
import { Geist } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';

const geistSans = Geist({
  weight: '400',
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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Link href="/search" className="mr-3 text-blue-500 hover:underline">
          ← Back
        </Link>
        <h1 className={`${geistSans.className} text-2xl font-bold`}>{categoryName}</h1>
      </div>
      
      {/* Search Bar */}
      <SearchBar placeholder={`Search in ${categoryName}...`} />
      
      {/* Products Grid */}
      <div className="mt-8">
        <h2 className={`${geistSans.className} mb-4 text-xl font-semibold`}>
          {categoryProducts.length} Products Available
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categoryProducts.map(product => (
            <div 
              key={product.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <h3 className="text-lg font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
              <p className="mt-2 font-semibold">${product.price.toFixed(2)}</p>
              <button className="mt-3 rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        
        {categoryProducts.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No products found in this category</p>
            <Link href="/search" className="mt-4 inline-block text-blue-500 hover:underline">
              Back to all categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 