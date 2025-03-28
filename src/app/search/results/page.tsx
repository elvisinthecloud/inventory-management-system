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
  { id: 1, name: 'Cinnamon', category: 'Spices', price: 3.99 },
  { id: 2, name: 'Cardamom', category: 'Spices', price: 5.99 },
  { id: 3, name: 'Basil', category: 'Herbs', price: 2.49 },
  { id: 4, name: 'Mint', category: 'Herbs', price: 1.99 },
  { id: 5, name: 'Vanilla Ice Cream', category: 'Ice Cream', price: 4.99 },
  { id: 6, name: 'Chocolate Ice Cream', category: 'Ice Cream', price: 4.99 },
  { id: 7, name: 'Tomatoes', category: 'Vegetables', price: 2.99 },
  { id: 8, name: 'Carrots', category: 'Vegetables', price: 1.49 },
  { id: 9, name: 'Apples', category: 'Fruits', price: 3.49 },
  { id: 10, name: 'Milk', category: 'Dairy', price: 2.49 },
];

export default function SearchResults({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const query = searchParams?.q || '';
  
  // Filter products based on search query
  const filteredProducts = query
    ? allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className={`${geistSans.className} text-2xl font-bold mb-6`}>Search Results</h1>
      
      {/* Search Bar */}
      <SearchBar placeholder="Refine your search..." />
      
      {/* Search query info */}
      <div className="mt-4">
        <p className="text-gray-600">
          {query ? (
            <>Search results for: <span className="font-semibold">"{query}"</span></>
          ) : (
            'Please enter a search term'
          )}
        </p>
      </div>
      
      {/* Results */}
      <div className="mt-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredProducts.map(product => (
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
        ) : query ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No products found matching "{query}"</p>
            <Link href="/search" className="mt-4 inline-block text-blue-500 hover:underline">
              Back to categories
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
} 