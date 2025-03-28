'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';
import { useInvoice } from '@/app/context/InvoiceContext';
import { useSearchParams } from 'next/navigation';

const geistSans = Geist({
  weight: '400',
  subsets: ['latin'],
});

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
      productsToUse = savedProducts.map((product: any) => ({
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