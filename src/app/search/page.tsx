'use client';

import React, { useState, useEffect } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { Geist } from "next/font/google";
import CategoryGrid from '../components/CategoryGrid';
import SearchBar from '../components/SearchBar';
import PageHeader from '@/app/components/PageHeader';

// Apply Geist font
const geistSans = Geist({
  weight: '400',
  subsets: ['latin'],
});

// Define interfaces for category and product
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

// Default categories if localStorage data is not available
const defaultCategories: Category[] = [
  { id: 1, name: 'Condimentos', image: '/images/categories/condimentos.jpg' },
  { id: 2, name: 'Granos y Legumbres', image: '/images/categories/granos.jpg' },
  { id: 3, name: 'Bebidas', image: '/images/categories/bebidas.jpg' },
  { id: 4, name: 'Frescos', image: '/images/categories/frescos.jpg' },
  { id: 5, name: 'Frutas y Vegetales', image: '/images/categories/frutas.jpg' },
  { id: 6, name: 'Lacteos', image: '/images/categories/lacteos.jpg' },
  { id: 7, name: 'Chiles', image: '/images/categories/chiles.jpg' },
  { id: 8, name: 'Especias', image: '/images/categories/especias.jpg' },
];

// This mapping is used to ensure consistent category IDs for known categories
const DEFAULT_CATEGORY_MAP: Record<string, number> = {
  'Condimentos': 1,
  'Granos y Legumbres': 2,
  'Bebidas': 3,
  'Frescos': 4,
  'Frutas y Vegetales': 5,
  'Lacteos': 6,
  'Chiles': 7,
  'Especias': 8
};

export default function SearchPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const { } = useInvoice();
  
  // Load categories from localStorage products
  useEffect(() => {
    console.log('SearchPage: useEffect started'); // Log start
    try {
      console.log('Loading categories from localStorage');
      const productsJson = localStorage.getItem('products');
      
      if (productsJson) {
        const products = JSON.parse(productsJson) as Product[];
        console.log('Products loaded:', products.length);
        
        // --- Start of complex category logic ---
        const uniqueCategories: Category[] = [];
        const categoryNames = new Set<string>();
        const categoryMap = new Map<string, { id: number, name: string }>();
        
        const usedCategoryIds = new Set<number>();
        Object.values(DEFAULT_CATEGORY_MAP).forEach(id => {
          usedCategoryIds.add(id);
        });
        
        products.forEach((product: Product) => {
          if (product.category && !categoryNames.has(product.category)) {
            categoryNames.add(product.category);
            if (DEFAULT_CATEGORY_MAP[product.category] !== undefined) {
              const categoryId = DEFAULT_CATEGORY_MAP[product.category];
              usedCategoryIds.add(categoryId);
              categoryMap.set(product.category, {
                id: categoryId,
                name: product.category,
              });
            } 
            else if (product.categoryId) {
              usedCategoryIds.add(product.categoryId);
              categoryMap.set(product.category, {
                id: product.categoryId,
                name: product.category,
              });
            }
          }
        });
        
        products.forEach((product: Product) => {
          if (product.category && !categoryMap.has(product.category)) {
            let newId = Object.keys(DEFAULT_CATEGORY_MAP).length + 1;
            while (usedCategoryIds.has(newId)) {
              newId++;
            }
            usedCategoryIds.add(newId);
            categoryMap.set(product.category, {
              id: newId,
              name: product.category,
            });
          }
        });
        
        categoryNames.forEach(categoryName => {
          const category = categoryMap.get(categoryName);
          if (!category) return;
          const existingCategory = defaultCategories.find(c => c.name === categoryName);
          uniqueCategories.push({
            id: category.id,
            name: categoryName,
            image: existingCategory ? existingCategory.image : '/images/categories/default.jpg'
          });
        });
        // --- End of complex category logic ---
        
        console.log('Final categories derived:', uniqueCategories.map(c => ({ id: c.id, name: c.name })));
        
        const categoryIds = uniqueCategories.map(c => c.id);
        const hasDuplicateIds = categoryIds.length !== new Set(categoryIds).size;
        if (hasDuplicateIds) {
          console.warn('WARNING: Duplicate category IDs before setting state:', 
            categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index));
          
          const seenIds = new Set<number>();
          const dedupedCategories = uniqueCategories.map(category => {
            if (seenIds.has(category.id)) {
              return { ...category, id: category.id + 10000 };
            }
            seenIds.add(category.id);
            return category;
          });
          
          setCategories(dedupedCategories);
          console.log('SearchPage: Categories state updated (with deduplication).');
        } else if (uniqueCategories.length > 0) {
          setCategories(uniqueCategories);
          console.log('SearchPage: Categories state updated.');
        } else {
          // Fallback if no unique categories derived but products existed
          setCategories(defaultCategories);
          console.log('SearchPage: Categories state set to default (no unique derived).');
        }
      } else {
        // No products in localStorage, use default
        setCategories(defaultCategories);
        console.log('SearchPage: No products in localStorage, Categories state set to default.');
      }
      console.log('SearchPage: useEffect finished successfully.'); // Log success
    } catch (error) {
      // Catch and log any error during the process
      console.error('SearchPage: Error in useEffect while processing categories:', error);
      // Fallback to default categories in case of error
      setCategories(defaultCategories);
      console.log('SearchPage: Categories state set to default due to error.');
    }
  }, []); // Dependency array is empty, runs once on mount

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${geistSans.className}`}>
      {/* Page Header - Keep as is */}
      <PageHeader 
        title="PRODUCT CATALOG" 
        fullWidth={true}
        withAction={
          <div className="text-gray-600 text-sm font-medium">
            {new Date().toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'})}
          </div>
        }
      />
      
      {/* Main content area */}
      <main className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12 flex-grow">
        
        {/* Section 1: Search Bar */}
        <section className="mb-12 md:mb-16 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
            Find Products Instantly
          </h2>
          <p className="text-gray-600 mb-6">
            Use the search bar below or browse categories to find what you need.
          </p>
          <SearchBar placeholder="Search by product name or keyword..." />
        </section>

        {/* Section 2: Categories */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Explore Categories
          </h2>
          {/* CategoryGrid will be styled differently via its own component */}
          <CategoryGrid categories={categories} />
        </section>

      </main>

      {/* Footer Info Section - Optional, can be removed or kept simple */}
      <footer className="w-full py-6 px-4 md:px-6 lg:px-8 text-center text-gray-500 text-sm border-t border-gray-200">
        Need help? Contact Support | © {new Date().getFullYear()} Elite-Prod
      </footer>
    </div>
  );
} 