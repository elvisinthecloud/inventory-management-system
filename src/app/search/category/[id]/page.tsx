'use client';

import React, { useState, useEffect } from 'react';
import { Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';
import { useInvoice } from '@/app/context/InvoiceContext';
import { useParams, useSearchParams } from 'next/navigation';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// Define the product interface
interface Product {
  id: number;
  name: string;
  category: string;
  categoryId: number;
  price: number;
  stock: number;
}

// Base product data without stock
const baseProducts = [
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

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = parseInt(params.id as string);
  const categoryName = searchParams?.get('name') || 'Category';
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
  
  // Filter products by category ID
  const categoryProducts = products.filter(product => {
    console.log('Filtering product:', product.name, 'Category ID:', product.categoryId, 'Looking for:', categoryId);
    
    // First try to match by categoryId (most reliable)
    if (product.categoryId === categoryId) {
      return true;
    }
    
    // Only fall back to category name if we absolutely have to
    if (product.categoryId === undefined && product.category === categoryName) {
      return true;
    }
    
    return false;
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