'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import CategoryGrid from '@/app/components/CategoryGrid';
import { useInvoice } from '@/app/context/InvoiceContext';

const geistSans = Geist({
  weight: '400',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// Define interfaces
interface Category {
  id: number;
  name: string;
  image: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  stock: number;
}

// Default categories data with images
const defaultCategories: Category[] = [
  { id: 1, name: 'Spices', image: '/images/categories/spices.jpg' },
  { id: 2, name: 'Herbs', image: '/images/categories/herbs.jpg' },
  { id: 3, name: 'Ice Cream', image: '/images/categories/icecream.jpg' },
  { id: 4, name: 'Vegetables', image: '/images/categories/vegetables.jpg' },
  { id: 5, name: 'Fruits', image: '/images/categories/fruits.jpg' },
  { id: 6, name: 'Dairy', image: '/images/categories/dairy.jpg' },
];

// Define a consistent mapping of default category names to IDs
const DEFAULT_CATEGORY_MAP: {[key: string]: number} = {
  'Spices': 1,
  'Herbs': 2,
  'Ice Cream': 3,
  'Vegetables': 4,
  'Fruits': 5,
  'Dairy': 6
};

export default function SearchPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const { getProductStock } = useInvoice();
  
  // Load categories from localStorage products
  useEffect(() => {
    const productsJson = localStorage.getItem('products');
    
    if (productsJson) {
      const products = JSON.parse(productsJson) as Product[];
      
      // Get unique categories from products
      const uniqueCategories: Category[] = [];
      const categoryNames = new Set<string>();
      const categoryMap = new Map<string, { id: number, name: string }>();
      
      // First collect all category names from products
      products.forEach((product: Product) => {
        if (product.category && !categoryNames.has(product.category)) {
          categoryNames.add(product.category);
          
          // Determine the best categoryId to use
          let categoryId: number;
          
          // Check if it's a default category first
          if (DEFAULT_CATEGORY_MAP[product.category] !== undefined) {
            categoryId = DEFAULT_CATEGORY_MAP[product.category];
          } 
          // Otherwise use the product's categoryId if available 
          else if (product.categoryId) {
            categoryId = product.categoryId;
          } 
          // Last resort: generate a new ID
          else {
            categoryId = Object.keys(DEFAULT_CATEGORY_MAP).length + categoryNames.size;
          }
          
          categoryMap.set(product.category, {
            id: categoryId,
            name: product.category,
          });
        }
      });
      
      // Then construct categories, maintaining default images where possible
      categoryNames.forEach(categoryName => {
        const category = categoryMap.get(categoryName);
        const existingCategory = defaultCategories.find(c => c.name === categoryName);
        
        uniqueCategories.push({
          id: category!.id,
          name: categoryName,
          // Use existing image or fallback to a default image
          image: existingCategory ? existingCategory.image : '/images/categories/default.jpg'
        });
      });
      
      if (uniqueCategories.length > 0) {
        setCategories(uniqueCategories);
      }
    }
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* Search Bar - made wider */}
      <div className="mx-auto max-w-4xl mb-12">
        <SearchBar placeholder="Search for products..." />
      </div>
      
      {/* Categories Section */}
      <div className="mt-4">
        <h2 className={`${robotoMono.className} mb-8 border-b-4 border-blue-500 pb-2 text-3xl uppercase tracking-wider text-gray-800`}>
          CATEGORIES
        </h2>
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
} 