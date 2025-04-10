'use client';

import React, { useState, useEffect } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { Geist } from "next/font/google";
import CategoryGrid from '../components/CategoryGrid';
import SearchBar from '../components/SearchBar';
import PageHeader from '@/app/components/PageHeader';
import { Product } from '../context/InvoiceContext';
import { baseProducts } from '../../data/defaultProducts';

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

// Helper function to derive categories from products
const deriveCategoriesFromProducts = (products: Product[]): Category[] => {
  console.log('Deriving categories from:', products.length, 'products');
  const uniqueCategories: Category[] = [];
  const categoryNames = new Set<string>();
  const categoryMap = new Map<string, { id: number, name: string }>();
  const usedCategoryIds = new Set<number>();

  // Add predefined category IDs
  Object.values(DEFAULT_CATEGORY_MAP).forEach(id => usedCategoryIds.add(id));

  // Process categories from products
  products.forEach((product: Product) => {
    if (product.category && !categoryNames.has(product.category)) {
      categoryNames.add(product.category);
      let categoryId: number | undefined;
      if (DEFAULT_CATEGORY_MAP[product.category] !== undefined) {
        categoryId = DEFAULT_CATEGORY_MAP[product.category];
      } else {
        // Generate a new ID if not predefined
        let newId = Math.max(8, ...usedCategoryIds) + 1; // Start from 9 or max used + 1
        while (usedCategoryIds.has(newId)) {
          newId++;
        }
        categoryId = newId;
      }
      // Ensure categoryId is defined before using it
      if (categoryId !== undefined) {
         usedCategoryIds.add(categoryId);
         categoryMap.set(product.category, { id: categoryId, name: product.category });
      }
    }
  });

  // Create final category objects with images
  categoryNames.forEach(categoryName => {
    const categoryInfo = categoryMap.get(categoryName);
    if (!categoryInfo) return;

    const defaultCat = defaultCategories.find(c => c.name === categoryName);
    uniqueCategories.push({
      id: categoryInfo.id,
      name: categoryName,
      image: defaultCat ? defaultCat.image : '/images/categories/default.jpg'
    });
  });

  console.log('Derived categories:', uniqueCategories.map(c => ({ id: c.id, name: c.name })));
  return uniqueCategories;
};

export default function SearchPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { } = useInvoice();
  
  useEffect(() => {
    console.log('SearchPage: useEffect started');
    try {
      const productsJson = localStorage.getItem('products');
      let productsToUse: Product[];

      if (productsJson) {
        console.log('Loading products from localStorage');
        productsToUse = JSON.parse(productsJson) as Product[];
      } else {
        console.log('No products in localStorage, using default baseProducts');
        productsToUse = baseProducts;
      }

      const derivedCategories = deriveCategoriesFromProducts(productsToUse);

      // Check for duplicate IDs (optional but good practice)
      const categoryIds = derivedCategories.map(c => c.id);
      const hasDuplicateIds = categoryIds.length !== new Set(categoryIds).size;
      if (hasDuplicateIds) {
        console.warn('WARNING: Duplicate category IDs detected:', 
          categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index));
        // Simple deduplication by adding offset - adjust if needed
        const seenIds = new Set<number>();
        const dedupedCategories = derivedCategories.map(category => {
          if (seenIds.has(category.id)) {
            return { ...category, id: category.id + Date.now() }; // Make ID unique
          }
          seenIds.add(category.id);
          return category;
        });
        setCategories(dedupedCategories);
        console.log('SearchPage: Categories state updated (with deduplication).');
      } else {
        setCategories(derivedCategories);
        console.log('SearchPage: Categories state updated.');
      }

      console.log('SearchPage: useEffect finished successfully.');
    } catch (error) {
      console.error('SearchPage: Error in useEffect while processing categories:', error);
      setCategories([]); // Set empty on error
      console.log('SearchPage: Categories state set to empty array due to error.');
    }
  }, []);

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
        
        {/* Search Bar - simplified */}
        <div className="mb-12 md:mb-16"> {/* Added a div for margin consistency */}
          <SearchBar placeholder="search" />
        </div>

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