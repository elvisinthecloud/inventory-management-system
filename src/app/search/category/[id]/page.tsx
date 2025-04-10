'use client';

import React, { useState, useEffect } from 'react';
import { Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';
import { useInvoice, Product } from '@/app/context/InvoiceContext';
import { baseProducts as sharedBaseProducts } from '@/data/defaultProducts';
import { useParams, useSearchParams } from 'next/navigation';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryName = searchParams?.get('name') || 'Category';
  const { getProductStock } = useInvoice();
  const [products, setProducts] = useState<Product[]>([]);
  
  // Load product data with current stock levels
  useEffect(() => {
    let productsSource: Product[];
    const productsJson = localStorage.getItem('products');

    if (productsJson) {
      console.log('CategoryPage: Loading products from localStorage');
      try {
        productsSource = JSON.parse(productsJson);
      } catch (error) {
        console.error("Error parsing products from localStorage:", error);
        console.log('CategoryPage: Falling back to shared baseProducts due to parse error.');
        productsSource = sharedBaseProducts; // Fallback on error
      }
    } else {
      console.log('CategoryPage: No products in localStorage, using shared baseProducts.');
      productsSource = sharedBaseProducts; // Use shared defaults if localStorage is empty
    }

    // Add current stock from context to each product
    const productsWithStock = productsSource.map(product => ({
      ...product,
      stock: getProductStock(product.id) // getProductStock handles undefined IDs returning 0
    }));
    
    setProducts(productsWithStock);
    console.log(`CategoryPage: Set ${productsWithStock.length} products with stock for category ${categoryName}.`);

  }, [getProductStock, categoryName]); // Add categoryName dependency if filtering depends on it directly here
  
  // Filter products by category name (more reliable than potentially inconsistent ID)
  const categoryProducts = products.filter(product => {
    return product.category === categoryName;
  });
  
  // Get badge color for category
  const getCategoryColor = () => {
    const name = categoryName.toLowerCase();
    if (name.includes('spice')) return 'from-amber-700 to-amber-600';
    if (name.includes('herb')) return 'from-emerald-700 to-emerald-600';
    if (name.includes('ice') || name.includes('cream')) return 'from-sky-700 to-sky-600';
    if (name.includes('vegetable')) return 'from-green-700 to-green-600';
    if (name.includes('fruit')) return 'from-red-700 to-red-600';
    if (name.includes('dairy')) return 'from-blue-700 to-blue-600';
    return 'from-gray-700 to-gray-600';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional header */}
      <div className="mb-8">
        <div className="bg-gray-800 px-6 py-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className={`${robotoMono.className} text-2xl uppercase tracking-wide text-white border-l-4 border-gray-500 pl-4`}>
              {categoryName}
            </h1>
            <div className="text-gray-300 text-sm font-medium">
              {categoryProducts.length} Products
            </div>
          </div>
        </div>
        {/* Subtle divider line with color specific to the category */}
        <div className={`h-1 bg-gradient-to-r ${getCategoryColor()}`}></div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 py-6 pb-28">
        {/* Back link and search bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <Link 
            href="/search" 
            className="mb-4 md:mb-0 flex items-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to categories
          </Link>
          
          <div className="w-full md:w-2/3 lg:w-1/2">
            <SearchBar placeholder={`Search in ${categoryName}...`} />
          </div>
        </div>
      
        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoryProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="text-xl text-gray-800 font-medium mb-2">No products found</p>
            <p className="text-gray-600 mb-8">We couldn&apos;t find any products in the {categoryName} category</p>
            <Link href="/search" className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Return to categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 