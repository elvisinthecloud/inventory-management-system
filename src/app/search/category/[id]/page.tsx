'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import Link from 'next/link';
import ProductCard from '@/app/components/ProductCard';
import { useInvoice } from '@/app/context/InvoiceContext';
import { useParams, useSearchParams } from 'next/navigation';

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
  
  // Filter products by category ID
  const categoryProducts = products.filter(product => {
    // First try to match by categoryId (most reliable)
    if (product.categoryId === categoryId) {
      return true;
    }
    
    // Fallback: If for some reason categoryId is missing or doesn't match,
    // check if the category name matches what we're looking for
    if (!product.categoryId && product.category === categoryName) {
      return true;
    }
    
    return false;
  });
  
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
      <div className="mt-6">
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {categoryProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-gray-600">No products found in this category</p>
            <Link href="/search" className="mt-6 inline-block rounded-md bg-blue-500 px-5 py-2 text-white hover:bg-blue-600">
              Back to categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 