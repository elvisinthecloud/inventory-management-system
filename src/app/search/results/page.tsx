'use client';

import React, { useState, useEffect } from 'react';
import { Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';
import { useInvoice } from '@/app/context/InvoiceContext';
import { useSearchParams } from 'next/navigation';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// Define the product interface
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

// Base product data without stock
const baseProducts = [
  { id: 1, name: 'Cinnamon', category: 'Spices', price: 3.99 },
  { id: 2, name: 'Cardamom', category: 'Spices', price: 5.99 },
  { id: 3, name: 'Turmeric', category: 'Spices', price: 2.99 },
  { id: 4, name: 'Basil', category: 'Herbs', price: 2.49 },
  { id: 5, name: 'Mint', category: 'Herbs', price: 1.99 },
  { id: 6, name: 'Rosemary', category: 'Herbs', price: 2.29 },
  { id: 7, name: 'Vanilla Ice Cream', category: 'Ice Cream', price: 4.99 },
  { id: 8, name: 'Chocolate Ice Cream', category: 'Ice Cream', price: 4.99 },
  { id: 9, name: 'Strawberry Ice Cream', category: 'Ice Cream', price: 5.49 },
  { id: 10, name: 'Tomatoes', category: 'Vegetables', price: 2.99 },
  { id: 11, name: 'Carrots', category: 'Vegetables', price: 1.49 },
  { id: 12, name: 'Broccoli', category: 'Vegetables', price: 1.99 },
  { id: 13, name: 'Apples', category: 'Fruits', price: 3.49 },
  { id: 14, name: 'Bananas', category: 'Fruits', price: 1.29 },
  { id: 15, name: 'Oranges', category: 'Fruits', price: 2.49 },
  { id: 16, name: 'Milk', category: 'Dairy', price: 2.49 },
  { id: 17, name: 'Cheese', category: 'Dairy', price: 3.99 },
  { id: 18, name: 'Yogurt', category: 'Dairy', price: 1.99 },
];

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const { getProductStock } = useInvoice();
  const [products, setProducts] = useState<Product[]>([]);
  
  // Load product data with current stock levels
  useEffect(() => {
    // Add stock from context to each product
    const productsJson = localStorage.getItem('products');
    let productsToUse;
    
    if (productsJson) {
      // If products exist in localStorage, use them
      const savedProducts = JSON.parse(productsJson);
      productsToUse = savedProducts.map((product: Product) => ({
        ...product,
        stock: getProductStock(product.id)
      }));
    } else {
      // Otherwise, use the default product data
      productsToUse = baseProducts.map(product => ({
        ...product,
        stock: getProductStock(product.id)
      }));
    }
    
    setProducts(productsToUse);
  }, [getProductStock]);
  
  // Filter products based on search query
  const filteredProducts = query
    ? products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional header */}
      <div className="mb-8">
        <div className="bg-gray-800 px-6 py-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className={`${robotoMono.className} text-2xl uppercase tracking-wide text-white border-l-4 border-gray-500 pl-4`}>
              Search Results
            </h1>
            <div className="text-gray-300 text-sm font-medium">
              {query ? (
                <span className="flex items-center">
                  <span className="hidden md:inline">Results for:</span>
                  <span className="font-semibold ml-1 bg-gray-700 px-2 py-1">{query}</span>
                </span>
              ) : (
                'Enter search term'
              )}
            </div>
          </div>
        </div>
        {/* Subtle divider line */}
        <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600"></div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 py-6 pb-28">
        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar placeholder="Refine your search..." />
        </div>
        
        {/* Search query info */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <p className="text-lg text-gray-700 mb-1">
                {query ? (
                  <>Showing results for <span className="font-semibold text-gray-900">&quot;{query}&quot;</span></>
                ) : (
                  'Please enter a search term'
                )}
              </p>
              {filteredProducts.length > 0 && (
                <p className="text-sm text-gray-500">
                  Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <Link 
              href="/search" 
              className="mt-4 md:mt-0 flex items-center text-gray-700 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Back to categories
            </Link>
          </div>
        </div>
        
        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : query ? (
          <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <p className="text-xl text-gray-800 font-medium mb-2">No products found</p>
            <p className="text-gray-600 mb-8">We couldn&apos;t find any products matching &quot;{query}&quot;</p>
            <Link href="/search" className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Return to search
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
} 