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
  { id: 1, name: 'Cinnamon', category: 'Spices', price: 3.99, stock: 15 },
  { id: 2, name: 'Cardamom', category: 'Spices', price: 5.99, stock: 8 },
  { id: 3, name: 'Turmeric', category: 'Spices', price: 2.99, stock: 20 },
  { id: 4, name: 'Basil', category: 'Herbs', price: 2.49, stock: 12 },
  { id: 5, name: 'Mint', category: 'Herbs', price: 1.99, stock: 18 },
  { id: 6, name: 'Rosemary', category: 'Herbs', price: 2.29, stock: 5 },
  { id: 7, name: 'Vanilla Ice Cream', category: 'Ice Cream', price: 4.99, stock: 10 },
  { id: 8, name: 'Chocolate Ice Cream', category: 'Ice Cream', price: 4.99, stock: 14 },
  { id: 9, name: 'Strawberry Ice Cream', category: 'Ice Cream', price: 5.49, stock: 7 },
  { id: 10, name: 'Tomatoes', category: 'Vegetables', price: 2.99, stock: 25 },
  { id: 11, name: 'Carrots', category: 'Vegetables', price: 1.49, stock: 30 },
  { id: 12, name: 'Broccoli', category: 'Vegetables', price: 1.99, stock: 15 },
  { id: 13, name: 'Apples', category: 'Fruits', price: 3.49, stock: 40 },
  { id: 14, name: 'Bananas', category: 'Fruits', price: 1.29, stock: 35 },
  { id: 15, name: 'Oranges', category: 'Fruits', price: 2.49, stock: 22 },
  { id: 16, name: 'Milk', category: 'Dairy', price: 2.49, stock: 42 },
  { id: 17, name: 'Cheese', category: 'Dairy', price: 3.99, stock: 6 },
  { id: 18, name: 'Yogurt', category: 'Dairy', price: 1.99, stock: 18 },
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
              <ProductCard key={product.id} product={product} />
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