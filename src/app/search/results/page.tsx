import React from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';

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
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className={`${robotoMono.className} mb-8 border-b-4 border-blue-500 pb-2 text-3xl uppercase tracking-wider text-gray-800`}>
        SEARCH RESULTS
      </h1>
      
      {/* Search Bar */}
      <div className="mx-auto max-w-4xl mb-6">
        <SearchBar placeholder="Refine your search..." />
      </div>
      
      {/* Search query info */}
      <div className="mb-8">
        <p className="text-lg text-gray-700">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                <p className="text-md text-gray-600">{product.category}</p>
                <p className="mt-3 text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                <button className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-gray-600">No products found matching "{query}"</p>
            <Link href="/search" className="mt-6 inline-block rounded-md bg-blue-500 px-5 py-2 text-white hover:bg-blue-600">
              Back to categories
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
} 